import numpy as np
import pandas as pd

df = pd.read_csv('data/data.csv')
columns_to_keep = ['rank', 'finalWorth', 'category', 'personName', 'age', 'country', 'source', 'industries', 'selfMade', 'gender', 'gross_tertiary_education_enrollment', 'life_expectancy_country', 'gdp_country', 'population_country']
df = df[columns_to_keep]
df['country'] = df['country'].replace({'Russia': 'Russian Federation', 'South Korea': 'Republic of Korea'})
df.dropna(inplace=True)
df['industries'] = df['industries'].replace('Finance & Investments', 'Finance')
df['industries'] = df['industries'].replace('Fashion & Retail', 'Fashion')
df['industries'] = df['industries'].replace('Food & Beverage', 'Food')
df['industries'] = df['industries'].replace('Media & Entertainment', 'Entertainment')
df['industries'] = df['industries'].replace('Metals & Mining', 'Mining')
df['industries'] = df['industries'].replace('Construction & Engineering', 'Construction')
df['industries'] = df['industries'].replace('Gambling & Casinos', 'Gambling')
df.to_csv('data/preprocessed_data.csv', index=False)

