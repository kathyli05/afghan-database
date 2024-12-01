import requests
import re
import pandas as pd

file_path = 'scopus_data.csv'
initial_df = pd.read_csv(file_path)


def get_abstract (link):
    doi_part = link.split("doi.org/")[-1]
    crossref_url = f"https://api.crossref.org/works/{doi_part}"
    response = requests.get(crossref_url)
    if response.status_code == 200:
        data = response.json().get('message', {})
        abstract = data.get('abstract', 'No abstract available')
        abstract = re.sub(r'<[^>]*jats:[^>]*>', '', abstract)
        abstract = re.sub(r'</?[^>]+>', '', abstract)
        return abstract 
    else:
        return 'N/A'

initial_df['abstract'] = initial_df['link'].apply(get_abstract)
initial_df.head()

def save_data_to_csv(data, filename="scopus_data.csv"):
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    print(f"Data has been successfully saved to {filename}.")

save_data_to_csv(initial_df)