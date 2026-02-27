import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report
import matplotlib.pyplot as plt


sheet = pd.DataFrame(pd.read_csv("bank_statement.csv"))
sheet.fillna({"Money In": 0},  inplace= True)
sheet.fillna({"Money Out": 0},  inplace= True)
sheet.fillna({"Fee": 0},  inplace= True)
sheet["Money Out"] = sheet["Money Out"].abs()
sheet["Fee"] = sheet["Fee"].abs()
sheet = sheet.dropna(subset=["Category"])

X = sheet["Description"]
y= sheet["Category"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state= 42)


vectoriser = TfidfVectorizer(lowercase=True, ngram_range=(1,2))
X_train_vectorised = vectoriser.fit_transform(X_train)
X_test_vectorised = vectoriser.transform(X_test)


category_model = LinearSVC(class_weight= 'balanced')

category_model.fit(X_train_vectorised, y_train)

y_pred = category_model.predict(X_test_vectorised)

# print(f'Accuracy score:', accuracy_score(y_test, y_pred))
# def predict_cat(sentence):
#   tfidf = vectoriser.transform([sentence])
#   print(category_model.predict(tfidf) ) 
# sentence_test = 'Sportscene Bloemfontein (Card 4719)'
# predict_cat(sentence_test)

total_expenditure = sheet["Money Out"].sum() + sheet["Fee"].sum()
total_income = sheet["Money In"].sum()
net_balance = total_income-total_expenditure


category_summary = sheet.groupby("Category")["Money Out"].sum()

highest_category = category_summary.idxmax()

top3 = category_summary.sort_values(ascending=False).head(5)


other_total = category_summary.sum() - top3.sum()

labels = list(top3.index) + ["Other"]
sizes = list(top3) + [other_total]

plt.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=80)

plt.title("Top 3 Spending Categories + Other")
# plt.show()

for category in sheet["Category"].unique():
  category_df = sheet[sheet["Category"]== category]
  if len(category_df)>= 10:
    X= category_df[["Money Out"]]

import pandas as pd
from sklearn.ensemble import IsolationForest


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

anomalies = df[df["Anomaly"] == -1]


print(anomalies.sort_values("Money Out", ascending=False).head(10))




  
  
  















