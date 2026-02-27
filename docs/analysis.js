function analyzeBankStatement(csvText) {
    const results = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    if (results.errors.length > 0) {
        throw new Error('CSV parsing failed: ' + results.errors[0].message);
    }

    let data = results.data;

    const dateColumn = data[0].hasOwnProperty('Transaction Date') ? 'Transaction Date' : 
                      data[0].hasOwnProperty('Posting Date') ? 'Posting Date' : 'Date';

    data = data.map(row => ({
        ...row,
        'Money In': parseFloat(row['Money In']) || 0,
        'Money Out': parseFloat(row['Money Out']) || 0,
        'Fee': parseFloat(row['Fee']) || 0,
        'Balance': parseFloat(row['Balance']) || 0,
        'Date': row[dateColumn] || '',
        'Description': (row['Description'] || '').toString(),
        'Original Description': (row['Original Description'] || '').toString(),
        'Category': (row['Category'] || '').toString(),
        'Parent Category': (row['Parent Category'] || '').toString()
    }));

    data = data.filter(row => row.Category && row.Category.trim() !== '');

    const moneyInTotal = data.reduce((sum, row) => sum + Math.abs(row['Money In']), 0);
    const moneyOutTotal = data.reduce((sum, row) => sum + Math.abs(row['Money Out']), 0);

    const moneyInTransactions = data
        .filter(row => row['Money In'] > 0)
        .sort((a, b) => Math.abs(b['Money In']) - Math.abs(a['Money In']))
        .slice(0, 5)
        .map(row => ({
            description: row.Description,
            amount: Math.abs(row['Money In']),
            percentage: moneyInTotal > 0 ? (Math.abs(row['Money In']) / moneyInTotal * 100).toFixed(1) : 0
        }));

    const moneyOutTransactions = data
        .filter(row => row['Money Out'] > 0)
        .sort((a, b) => Math.abs(b['Money Out']) - Math.abs(a['Money Out']))
        .slice(0, 5)
        .map(row => ({
            description: row.Description,
            amount: Math.abs(row['Money Out']),
            percentage: moneyOutTotal > 0 ? (Math.abs(row['Money Out']) / moneyOutTotal * 100).toFixed(1) : 0
        }));

    const categoryGroups = {};
    data.forEach(row => {
        const category = row.Category;
        const amount = Math.abs(row['Money Out']);
        if (amount > 0) {
            if (!categoryGroups[category]) {
                categoryGroups[category] = [];
            }
            categoryGroups[category].push({
                description: row.Description,
                amount: amount,
                date: row.Date
            });
        }
    });

    const categorySummary = Object.entries(categoryGroups)
        .map(([category, transactions]) => ({
            category: category,
            total: transactions.reduce((sum, t) => sum + t.amount, 0),
            count: transactions.length
        }))
        .sort((a, b) => b.total - a.total);

    const top5Categories = categorySummary.slice(0, 5);
    const otherCategories = categorySummary.slice(5);
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.total, 0);

    const categoryPieSummary = [...top5Categories];
    if (otherTotal > 0) {
        categoryPieSummary.push({
            category: 'Other',
            total: otherTotal,
            count: otherCategories.reduce((sum, cat) => sum + cat.count, 0)
        });
    }

    const grandTotal = categoryPieSummary.reduce((sum, cat) => sum + cat.total, 0);
    categoryPieSummary.forEach(cat => {
        cat.percentage = grandTotal > 0 ? (cat.total / grandTotal * 100).toFixed(1) : 0;
    });

    const anomalies = [];
    Object.entries(categoryGroups).forEach(([category, transactions]) => {
        if (transactions.length >= 10) {
            const amounts = transactions.map(t => t.amount);
            const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
            const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);

            transactions.forEach(transaction => {
                const zScore = stdDev > 0 ? Math.abs((transaction.amount - mean) / stdDev) : 0;
                if (zScore > 2.5) {
                    anomalies.push({
                        category: category,
                        description: transaction.description,
                        amount: transaction.amount,
                        date: transaction.date,
                        zScore: zScore
                    });
                }
            });
        }
    });

    anomalies.sort((a, b) => b.amount - a.amount);
    const topAnomalies = anomalies.slice(0, 5).map(a => ({
        category: a.category,
        description: a.description,
        amount: a.amount
    }));

    return {
        money_in_total: moneyInTotal,
        money_out_total: moneyOutTotal,
        money_in_transactions: moneyInTransactions,
        money_out_transactions: moneyOutTransactions,
        category_pie_summary: categoryPieSummary,
        anomalies: topAnomalies
    };
}
