// Load analysis data when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

function loadDashboardData() {
  const storedData = localStorage.getItem('bankAnalysisData');
  
  if (!storedData) {
    showError('No analysis data available. Please upload a CSV file first.');
    setTimeout(() => {
      window.location.href = 'upload.html';
    }, 3000);
    return;
  }
  
  try {
    const data = JSON.parse(storedData);
    console.log('Raw data from localStorage:', data);
    console.log('Money In Transactions:', data.money_in_transactions);
    console.log('Money Out Transactions:', data.money_out_transactions);
    console.log('Category Pie Summary:', data.category_pie_summary);
    
    updateDashboard({
      success: true,
      total_income: data.money_in_total,
      total_expenditure: data.money_out_total,
      money_in_transactions: data.money_in_transactions,
      money_out_transactions: data.money_out_transactions,
      category_pie_summary: data.category_pie_summary,
      anomalies: data.anomalies
    });
  } catch (error) {
    console.error('Error parsing data:', error);
    showError('Failed to load analysis data');
    setTimeout(() => {
      window.location.href = 'upload.html';
    }, 3000);
  }
}

function updateDashboard(data) {
  console.log('updateDashboard called with:', data);
  
  // Update total income
  document.getElementById('totalIncome').textContent = 
    formatCurrency(data.total_income);
  
  // Update total expenditure
  document.getElementById('totalExpenditure').textContent = 
    formatCurrency(data.total_expenditure);
  
  // Update money in transactions
  const moneyInContainer = document.getElementById('moneyInTransactions');
  moneyInContainer.innerHTML = '';
  
  console.log('Processing money_in_transactions:', data.money_in_transactions);
  
  if (data.money_in_transactions && data.money_in_transactions.length > 0) {
    data.money_in_transactions.forEach((transaction, index) => {
      console.log(`Money In Transaction ${index}:`, transaction);
      const percentage = getDisplayPercentage(transaction.amount, data.total_income);
      const transactionDiv = document.createElement('div');
      transactionDiv.className = 'transaction-row';
      transactionDiv.innerHTML = `
        <div class="text">
          <print>${transaction.description || 'Unknown'}: R ${formatNumber(transaction.amount)}</print>
        </div>
        <div class="progress-bar">
          <span class="money" style="width: ${percentage}%"></span>
        </div>
      `;
      moneyInContainer.appendChild(transactionDiv);
    });
  } else {
    console.log('No money_in_transactions found or empty array');
  }
  
  // Update money out transactions
  const moneyOutContainer = document.getElementById('moneyOutTransactions');
  moneyOutContainer.innerHTML = '';
  
  console.log('Processing money_out_transactions:', data.money_out_transactions);
  
  if (data.money_out_transactions && data.money_out_transactions.length > 0) {
    data.money_out_transactions.forEach((transaction, index) => {
      console.log(`Money Out Transaction ${index}:`, transaction);
      const percentage = getDisplayPercentage(transaction.amount, data.total_expenditure);
      const transactionDiv = document.createElement('div');
      transactionDiv.className = 'transaction-row';
      transactionDiv.innerHTML = `
        <div class="text">
          <print>${transaction.description || 'Unknown'}: R ${formatNumber(transaction.amount)}</print>
        </div>
        <div class="progress-bar">
          <span class="money-out-bar" style="width: ${percentage}%"></span>
        </div>
      `;
      moneyOutContainer.appendChild(transactionDiv);
    });
  } else {
    console.log('No money_out_transactions found or empty array');
  }
  
  // Update anomalies
  const anomalyList = document.getElementById('anomalyList');
  anomalyList.innerHTML = '';
  
  if (data.anomalies && data.anomalies.length > 0) {
    data.anomalies.forEach(anomaly => {
      const anomalyDiv = document.createElement('div');
      anomalyDiv.style.marginTop = '15px';
      anomalyDiv.style.padding = '10px';
      anomalyDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      anomalyDiv.style.borderRadius = '8px';
      anomalyDiv.innerHTML = `
        <div style="font-size: clamp(10px, 1.8vw, 16px);">
          <strong>${anomaly.category || 'Unknown'}</strong><br>
          ${anomaly.description}<br>
          <span style="color: #ff6b6b;">R ${formatNumber(anomaly.amount)}</span>
        </div>
      `;
      anomalyList.appendChild(anomalyDiv);
    });
  } else {
    anomalyList.innerHTML = '<p>No anomalies detected</p>';
  }
  
  // Update spending summary pie chart
  const categoryPieChart = document.getElementById('categoryPieChart');
  const categoryPieLegend = document.getElementById('categoryPieLegend');
  categoryPieLegend.innerHTML = '';
  categoryPieChart.style.background = 'rgba(255, 255, 255, 0.15)';
  
  console.log('Processing category_pie_summary:', data.category_pie_summary);
  
  if (data.category_pie_summary && data.category_pie_summary.length > 0) {
    console.log('Mapping pie categories...');
    const pieCategories = data.category_pie_summary.map(cat => {
      console.log('Category:', cat);
      return [cat.category, cat.total];
    });
    console.log('Pie categories mapped:', pieCategories);
    renderCategoryPieChart(pieCategories, categoryPieChart, categoryPieLegend);
  } else {
    console.log('No category_pie_summary found or empty array');
    categoryPieChart.style.background = 'rgba(255, 255, 255, 0.15)';
    categoryPieLegend.innerHTML = '<p>No pie data available</p>';
  }
}

function renderCategoryPieChart(categories, pieChartElement, pieLegendElement) {
  if (!categories || categories.length === 0) {
    pieChartElement.style.background = 'rgba(255, 255, 255, 0.15)';
    pieLegendElement.innerHTML = '<p>No pie data available</p>';
    return;
  }

  const colors = ['#c42d61', '#2e5bff', '#2ea36a', '#f2a33a', '#8a56d8', '#6f7b8a'];
  const total = categories.reduce((sum, [, amount]) => sum + amount, 0);

  if (!total || total <= 0) {
    pieChartElement.style.background = 'rgba(255, 255, 255, 0.15)';
    pieLegendElement.innerHTML = '<p>No pie data available</p>';
    return;
  }

  let currentStart = 0;
  const gradientParts = [];
  pieLegendElement.innerHTML = '';

  categories.forEach(([label, amount], index) => {
    const rawPercentage = getPercentage(amount, total);
    const end = currentStart + rawPercentage;
    const color = colors[index % colors.length];

    gradientParts.push(`${color} ${currentStart}% ${end}%`);

    const legendRow = document.createElement('div');
    legendRow.className = 'pie-legend-row';
    legendRow.innerHTML = `
      <span class="pie-dot" style="background-color: ${color};"></span>
      <span>${label} - ${rawPercentage.toFixed(1)}%</span>
    `;
    pieLegendElement.appendChild(legendRow);

    currentStart = end;
  });

  pieChartElement.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}

function formatCurrency(amount) {
  return 'R ' + formatNumber(amount);
}

function getPercentage(amount, total) {
  if (!total || total <= 0) {
    return 0;
  }

  const value = (amount / total) * 100;
  return Math.max(0, Math.min(100, value));
}

function getDisplayPercentage(amount, total) {
  const raw = getPercentage(amount, total);
  if (raw === 0) {
    return 0;
  }

  const boosted = 25 + (raw * 0.75);
  return Math.max(25, Math.min(100, boosted));
}

function formatNumber(num) {
  return Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function showError(message) {
  document.body.innerHTML += `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: rgba(255, 0, 0, 0.9); color: white; padding: 20px; 
                border-radius: 10px; text-align: center; z-index: 9999;">
      <h3>${message}</h3>
      <p>Redirecting to upload page...</p>
    </div>
  `;
}
