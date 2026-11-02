# Personal Finance Tracker & Transaction Analysis

## Overview

A Python-based personal finance analysis project that processes bank statement data to provide insights into income, expenditure, spending patterns and unusual transactions.

The project uses machine learning to automatically categorise transactions based on their descriptions and applies anomaly detection to identify transactions that differ significantly from typical spending within their respective categories.

## Features

- **Bank Statement Processing:** Reads and processes transaction data from a CSV bank statement.
- **Data Cleaning:** Handles missing values, prepares transaction amounts and removes records without category labels.
- **Transaction Classification:** Uses TF-IDF vectorisation and a Linear Support Vector Classifier (LinearSVC) to categorise transactions based on their descriptions.
- **Financial Summary:** Calculates total income, total expenditure and net balance.
- **Spending Analysis:** Groups expenditure by category and identifies the highest spending categories.
- **Data Visualisation:** Uses Matplotlib to display the distribution of spending across categories.
- **Anomaly Detection:** Applies Isolation Forest separately to eligible spending categories to identify unusually large transactions.

## Technologies Used

- Python
- Pandas
- Scikit-learn
- Matplotlib

Machine Learning Techniques

| Technique | Purpose |
| TF-IDF | Converts transaction descriptions into numerical features. |
| LinearSVC | Classifies transactions into spending categories. |
| Isolation Forest | Identifies unusual transaction amounts within spending categories. |

## How It Works

1. Data Processing
The project loads bank statement data from a CSV file using Pandas. Missing monetary values are handled, transaction amounts are standardised, and records without category labels are excluded from the classification dataset.

2. Transaction Classification
Transaction descriptions are converted into numerical representations using TF-IDF vectorisation. A LinearSVC model is trained using the labelled transactions to predict spending categories.

3. Financial Analysis
The processed data is used to calculate:

- Total income
- Total expenditure, including fees
- Net balance
- Spending totals per category

4. Spending Visualisation
A pie chart displays the distribution of expenditure across the five highest spending categories, with the remaining categories grouped under "Other".

5. Anomaly Detection
Isolation Forest models are trained separately for each spending category containing at least ten transactions. The models identify transaction amounts that differ from the typical spending patterns within those categories.

## Requirements

Install the required Python libraries:

```bash
pip install pandas scikit-learn matplotlib
```

## Running the Project

1. Clone the repository.
2. Place your bank statement CSV file in the project directory.
3. Ensure the CSV contains the required columns:
   - `Description`
   - `Category`
   - `Money In`
   - `Money Out`
   - `Fee`
4. Run the Python script.

## Limitations

- The project currently processes CSV files rather than directly connecting to banking services.
- Transaction classification depends on the availability and quality of labelled training data.
- Anomaly detection identifies statistically unusual transaction amounts; it does not determine whether a transaction is fraudulent.
- Anomaly detection is only performed for categories containing at least ten expenditure transactions.
- The current implementation analyses one statement dataset at a time.
