from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np 
from sklearn.preprocessing import StandardScaler
import pandas as pd
app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['GET'])
def hello_world():
    # Load data from CSV file
    data = pd.read_csv('data/preprocessed_data.csv')[:1500]
    
    # Convert DataFrame to JSON
    return jsonify(data.to_dict(orient='records'))

@app.route('/api/data/groupby/', methods=['GET'])
def grouped_by_data():
    field = request.args.get('field', 'country')
    country = request.args.get('country', 'none')
    industry = request.args.get('industry', 'none')
    gender = request.args.get('gender', 'none')
    selfMade = request.args.get('selfMade', 'none')
    # Load data from CSV file
    data = pd.read_csv('data/preprocessed_data.csv')[:2500]
    if country != 'none':
        data = data[data['country'] == country]
    elif industry != 'none':
        data = data[data['industry'] == industry]
    elif gender != 'none':
        data = data[data['gender'] == gender]
    elif selfMade != 'none':
        data = data[data['selfMade'] == selfMade]
    df_grouped = data.groupby(field).size().reset_index(name='value')

    # Sort the DataFrame by count in descending order
    df_grouped = df_grouped.sort_values(by='value', ascending=False)
    
    # Convert DataFrame to JSON
    return jsonify(df_grouped.to_dict(orient='records'))

@app.route('/api/data/pie/', methods=['GET'])
def pie_chart_data():
    field = request.args.get('field', 'gender')
    country = request.args.get('country', 'none')
    industry = request.args.get('industry', 'none')
    gender = request.args.get('gender', 'none')
    selfMade = request.args.get('selfMade', 'none')
    # Load data from CSV file
    data = pd.read_csv('data/preprocessed_data.csv')[:2500]
    if country != 'none':
        data = data[data['country'] == country]
    if industry != 'none':
        data = data[data['industries'] == industry]
    if gender != 'none':
        data = data[data['gender'] == gender]
    if selfMade != 'none':
        data = data[data['selfMade'] == selfMade]
    df_grouped = data.groupby(field).size().reset_index(name='value')

    # Sort the DataFrame by count in descending order
    df_grouped = df_grouped.sort_values(by='value', ascending=False)
    
    # Convert DataFrame to JSON
    return jsonify(df_grouped.to_dict(orient='records'))

@app.route('/api/histogram')
def histogram():
    # Simulating data fetching - replace with your actual data fetching logic
    df = pd.read_csv('data/preprocessed_data.csv')[:2500]
    
    # Calculate histogram bins and counts
    bin_series = pd.cut(df['age'], bins=10, retbins=False)
    counts = bin_series.value_counts().sort_index()
    bin_edges = bin_series.cat.categories.to_numpy().astype(float) # Convert bin edges to numpy array and then to float

    # Generate the bins data for the response
    bins_data = [
        {"x0": edge.left, "x1": edge.right, "count": counts.loc[edge]}
        for edge in bin_edges
    ]
    
    return jsonify(bins_data)

@app.route('/api/pcp-data', methods=['GET'])
def get_pcp_data():
    df = pd.read_csv('data/preprocessed_data.csv')[:100]
    columns_to_keep = ["finalWorth", "industries", "age", "country", 
                       "gross_tertiary_education_enrollment", "population_country"]
    df = df[columns_to_keep]

    numerical_columns = ["finalWorth", "age", "gross_tertiary_education_enrollment", 
                         "population_country"]
    scaler = StandardScaler()
    df[numerical_columns] = scaler.fit_transform(df[numerical_columns])

    # Additional data processing steps here...

    data_json = df.to_dict(orient='records')
    return jsonify(data_json)

@app.route('/api/word-cloud', methods=['GET'])
def world_cloud():
    # Load data from CSV file
    country = request.args.get('country', 'none')
    industry = request.args.get('industry', 'none')
    data = pd.read_csv('data/preprocessed_data.csv')
    if country != 'none':
        data = data[data['country'] == country]
    if industry != 'none':
        data = data[data['industries'] == industry]
    
    # Convert DataFrame to JSON
    return jsonify(data[0:7].to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True)
