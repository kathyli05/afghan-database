import pandas as pd

file_path = 'scopus_data.csv'
initial_df = pd.read_csv(file_path)
print(len(initial_df[initial_df['abstract'] == 'No abstract available']))
print(len(initial_df[initial_df['abstract'] == N/A]))