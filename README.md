# Bank Statement Analysis Web Application

A web application that analyzes bank statements and detects spending anomalies using machine learning. Available in two versions:
- **Client-Side Version**: Pure JavaScript running entirely in your browser (GitHub Pages)
- **Server-Side Version**: Python Flask backend with ML capabilities

## 🚀 Quick Start (GitHub Pages - Recommended)

### Live Demo
Visit: `https://codedbyttom-lab.github.io/-bank-statement-analyzer/`

### How to Use
1. Open the web application
2. Drag & drop your CSV bank statement or click to upload
3. View instant analysis with:
   - Total income and expenditure
   - Top transactions by amount
   - Spending breakdown by category (pie chart)
   - Anomaly detection in spending patterns

### CSV Format Required
Your CSV should contain these columns:
- **Transaction Date** or **Posting Date**
- **Description**
- **Money In**
- **Money Out**
- **Category**
- Fee (optional)
- Balance (optional)

### Privacy & Security
✅ All processing happens in your browser  
✅ No data is sent to any server  
✅ No data is stored permanently  
✅ Works completely offline after initial load

---

## 🐍 Alternative: Flask Server Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

### 3. Access the Application
```
http://localhost:5000
```

---

## 📁 Folder Structure
```
Bank/
├── app.py              # Flask backend (server version)
├── category.py         # Standalone analysis script
├── Layout/             # Frontend files
│   ├── index.html      # Upload page (GitHub Pages entry)
│   ├── homepage.html   # Dashboard page
│   ├── upload.css      # Upload page styles
│   ├── homepage.css    # Dashboard styles
│   ├── analysis.js     # Client-side ML engine
│   ├── upload.js       # Upload page logic
│   ├── dashboard.js    # Dashboard logic
│   └── assets/         # Images and other assets
└── requirements.txt    # Python dependencies
```

## ✨ Features
- 📤 CSV file upload with drag & drop interface
- 🎯 Automatic transaction categorization
- 📊 Spending analysis by category with pie chart
- 🔍 Anomaly detection using statistical methods (Z-score)
- 📈 Interactive dashboard with visual progress bars
- 🎨 Modern glassmorphism UI design
- 💻 Client-side processing (no backend required)

## 🛠️ Technologies

**Client-Side Version:**
- Pure JavaScript (ES6+)
- PapaParse (CSV parsing)
- Z-score anomaly detection
- LocalStorage for data persistence

**Server-Side Version:**
- Python Flask
- scikit-learn (TF-IDF, LinearSVC, Isolation Forest)
- pandas (data processing)

---

## 📝 GitHub Pages Deployment

This project is configured to run on GitHub Pages at:
`https://codedbyttom-lab.github.io/origin/`

All files in the `/Layout` folder are served as static content with client-side processing.
