# Bank Statement Analysis Web Application

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

### 3. Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## How to Use

1. **Upload CSV File**: The home page allows you to drag & drop or select a CSV file
2. **CSV Format**: Your CSV should contain columns like:
   - Date
   - Description
   - Money In
   - Money Out
   - Fee (optional)
   - Category (optional - will be auto-categorized if missing)

3. **View Dashboard**: After upload, you'll be redirected to the dashboard showing:
   - Total income and expenditure
   - Top transactions
   - Spending by category
   - Detected anomalies in spending patterns

## Folder Structure
```
Bank/
├── app.py              # Flask application
├── Layout/             # Frontend files
│   ├── upload.html     # Upload page
│   ├── upload.css      # Upload page styles
│   ├── upload.js       # Upload page logic
│   ├── homepage.html   # Dashboard page
│   ├── homepage.css    # Dashboard styles
│   ├── dashboard.js    # Dashboard logic
│   └── assets/         # Images and other assets
├── uploads/            # Uploaded CSV files (created automatically)
└── requirements.txt    # Python dependencies
```

## Features
- CSV file upload with drag & drop
- Automatic transaction categorization
- Spending analysis by category
- Anomaly detection in spending patterns
- Interactive dashboard with visual progress bars
