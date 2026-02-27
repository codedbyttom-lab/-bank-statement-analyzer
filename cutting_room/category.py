import pandas as pd
import camelot
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.utils import resample


stream_table = camelot.read_pdf("bank_statement.pdf", pages="all", flavor="stream")
all_tables = [t.df for t in stream_table]

expected_cols = ['Date', 'Description', 'Category', 'Money In', 'Money Out', 'Fee*', 'Balance']
clean_tables = []


for table in all_tables:

    
    table.columns = table.iloc[0]
    table = table[2:]


    if "Transaction History" in table.columns:
        table.columns = ['Date', 'Description', 'Category', 'Money In', 'Money Out', 'Fee*', 'Balance']

    if list(table.columns) == expected_cols:
        clean_tables.append(table)


combined_tables = pd.concat(clean_tables, ignore_index=True)


combined_tables['Description'] = combined_tables['Description'].str.lower().str.strip()


counts = combined_tables['Category'].value_counts()
rare_categories = counts[counts < 3].index
combined_tables['Category'] = combined_tables['Category'].replace(rare_categories, 'Other')



X, y = combined_tables['Description'], combined_tables['Category']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify= y)


df_train = pd.concat([X_train, y_train], axis=1)
rare_train = df_train[df_train['Category'] == 'Other']
common_train = df_train[df_train['Category'] != 'Other']
rare_upsampled = resample(rare_train, replace=True, n_samples=len(common_train), random_state=42, )
df_train_balanced = pd.concat([common_train, rare_upsampled])
X_train_balanced = df_train_balanced['Description']
y_train_balanced = df_train_balanced['Category']

vectorizer = TfidfVectorizer(lowercase=True, ngram_range=(1,2))
X_train_vec = vectorizer.fit_transform(X_train_balanced)
X_test_vec = vectorizer.transform(X_test)

from sklearn.svm import LinearSVC

model = LinearSVC(class_weight= "balanced")
model.fit(X_train_vec, y_train_balanced)

y_pred = model.predict(X_test_vec)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))