from flask import Flask, render_template, request, jsonify, redirect, url_for
import pandas as pd
import os
from werkzeug.utils import secure_filename
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.ensemble import IsolationForest
import json

app = Flask(__name__, 
            template_folder='Layout',
            static_folder='Layout')

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 10 * 1024 * 1024

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

analyzed_data = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def analyze_bank_statement(csv_path):
    try:
        sheet = pd.read_csv(csv_path)
        
        if "Transaction Date" in sheet.columns:
            sheet["Date"] = sheet["Transaction Date"]
        elif "Posting Date" in sheet.columns:
            sheet["Date"] = sheet["Posting Date"]
        elif "Date" not in sheet.columns:
            sheet["Date"] = ""
        
        sheet.fillna({"Money In": 0}, inplace=True)
        sheet.fillna({"Money Out": 0}, inplace=True)
        sheet.fillna({"Fee": 0}, inplace=True)
        
        sheet["Money Out"] = sheet["Money Out"].abs()
        sheet["Fee"] = sheet["Fee"].abs()
        
        sheet = sheet.dropna(subset=["Category"])
        
        X = sheet["Description"]
        y = sheet["Category"]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        vectoriser = TfidfVectorizer(lowercase=True, ngram_range=(1, 2))
        X_train_vectorised = vectoriser.fit_transform(X_train)
        X_test_vectorised = vectoriser.transform(X_test)
        
        category_model = LinearSVC(class_weight='balanced')
        category_model.fit(X_train_vectorised, y_train)
        
        total_expenditure = sheet["Money Out"].sum() + sheet["Fee"].sum()
        total_income = sheet["Money In"].sum()
        net_balance = total_income - total_expenditure
        
        money_in_transactions = sheet[sheet["Money In"] > 0].nlargest(3, "Money In")[
            ["Description", "Money In", "Date"]
        ].to_dict('records')
        
        money_out_transactions = sheet[sheet["Money Out"] > 0].nlargest(3, "Money Out")[
            ["Description", "Money Out", "Date"]
        ].to_dict('records')
        
        category_summary = sheet.groupby("Category")["Money Out"].sum()
        
        top5 = category_summary.sort_values(ascending=False).head(5)
        other_total = category_summary.sum() - top5.sum()
        
        category_pie_summary = dict(top5)
        if other_total > 0:
            category_pie_summary["Other"] = other_total
        
        df = sheet[sheet["Money Out"] > 0].copy()
        df["Anomaly"] = 0
        
        for category in df["Category"].unique():
            category_df = df[df["Category"] == category]
            
            if len(category_df) >= 10:
                X = category_df[["Money Out"]]
                
                iso_model = IsolationForest(
                    contamination=0.05,
                    random_state=42
                )
                
                iso_model.fit(X)
                predictions = iso_model.predict(X)
                df.loc[category_df.index, "Anomaly"] = predictions
        
        anomalies_df = df[df["Anomaly"] == -1].sort_values("Money Out", ascending=False).head(5)
        anomalies = [
            {
                "description": row["Description"],
                "amount": row["Money Out"],
                "category": row["Category"],
                "date": row["Date"]
            }
            for _, row in anomalies_df.iterrows()
        ]
        
        return {
            "success": True,
            "total_income": float(total_income),
            "total_expenditure": float(total_expenditure),
            "net_balance": float(net_balance),
            "money_in_transactions": money_in_transactions,
            "money_out_transactions": money_out_transactions,
            "category_summary": dict(top5),
            "category_pie_summary": category_pie_summary,
            "anomalies": anomalies
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.route('/')
def index():
    return render_template('upload.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        global analyzed_data
        analyzed_data = analyze_bank_statement(filepath)
        
        if analyzed_data["success"]:
            return jsonify({
                "success": True,
                "message": "File uploaded and analyzed successfully",
                "redirect": "/dashboard"
            })
        else:
            return jsonify({
                "success": False,
                "error": analyzed_data.get("error", "Analysis failed")
            }), 400
    
    return jsonify({"error": "Invalid file type"}), 400


@app.route('/dashboard')
def dashboard():
    return render_template('homepage.html')


@app.route('/api/data')
def get_data():
    global analyzed_data
    if analyzed_data:
        return jsonify(analyzed_data)
    return jsonify({"error": "No data available"}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
