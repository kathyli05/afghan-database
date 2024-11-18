import httpx
import openai
import json
import requests
import re
import math
import time
from bs4 import BeautifulSoup
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()
scopus_api_key = os.getenv("SCOPUS_API")
print(scopus_api_key)
openai.api_key = os.getenv("OPEN_AI_API")

headers = {
    "X-ELS-APIKey": scopus_api_key,
    "Accept": 'application/json',
    "view": "COMPLETE"
}

timeout = httpx.Timeout(10.0, connect=60.0)
client = httpx.Client(timeout=timeout, headers=headers)

def fetch_scopus_data(start):
    query = f"?query=((KEY(Afghanistan) OR KEY(Taliban)) AND (KEY(rights) OR KEY('civil liberties') OR KEY('violations') OR KEY('gender') OR KEY('women') OR KEY('governance') OR KEY('UN') OR KEY('security') OR KEY('humanitarian') OR KEY('health'))) AND PUBYEAR > 2021&start={start}&count=25"
    url = f"https://api.elsevier.com/content/search/scopus{query}"
    response = client.get(url)
    return response.json()

def fetch_crossref_metadata(doi):
    crossref_url = f"https://api.crossref.org/works/{doi}"
    response = requests.get(crossref_url)
    if response.status_code == 200:
        data = response.json().get('message', {})
        title = data.get('title', ['N/A'])[0]
        authors = [f"{author.get('given', '')} {author.get('family', '')}".strip() for author in data.get('author', [])]
        abstract = data.get('abstract', 'No abstract available')
        abstract = re.sub(r'<[^>]*jats:[^>]*>', '', abstract)
        abstract = re.sub(r'</?[^>]+>', '', abstract)
        published_online = data.get('published-online', {}).get('date-parts', [['N/A']])[0]
        return {
            'authors': ", ".join(authors) if authors else 'N/A',
            'published_online': "-".join(map(str, published_online))
        }
    else:
        print(f"Failed to retrieve CrossRef metadata for DOI {doi}: {response.status_code}")
        return {
            'authors': 'N/A',
            'published_online': 'N/A'
        }

def extract_data(entry):
    source_name = entry.get('dc:title')
    doi = entry.get('prism:doi')
    source_link = f"https://doi.org/{doi}" if doi else "DOI not available"
    associated_orgs = [org.get('affilname') for org in entry.get('affiliation', [])]
    type_of_pub = entry.get('subtypeDescription')
    open_access = entry.get('openaccess')

    # Fetch data from CrossRef if DOI is available
    if doi:
        crossref_data = fetch_crossref_metadata(doi)
        author = crossref_data['authors']
        date_of_pub = crossref_data['published_online']
    else:
        author = 'N/A'
        date_of_pub = 'N/A'

    # print(f"Source Name: {source_name}")
    # print(f"Author: {author}")
    # print(f"Source Link: {source_link}")
    # print(f"Date of Publication: {date_of_pub}")
    # print(f"Associated Organizations: {associated_orgs}")
    # print(f"Type of Publication: {type_of_pub}")
    # print(f"Open Access: {open_access}")

    return {
        'source_name': source_name,
        'author': author,
        'link': source_link,
        'date_of_pub': date_of_pub,
        'associated_orgs': associated_orgs,
        'type_of_pub': type_of_pub,
        'open_access_bin': open_access,
    }

def collect_all_data(iterations):
    all_data = []
    
    for i in range(iterations):
        start = i * 25
        scopus_data = fetch_scopus_data(start)
        
        if scopus_data and 'search-results' in scopus_data and 'entry' in scopus_data['search-results']:
            entries = scopus_data['search-results']['entry']
            #print(f"Number of entries in page {i + 1}: {len(entries)}")
            
            for entry in entries:
                data = extract_data(entry)
                all_data.append(data)
        else:
            print('No entries found in the response.')
    return all_data

def save_data_to_csv(data, filename="scopus_data.csv"):
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    print(f"Data has been successfully saved to {filename}.")

initial_results = fetch_scopus_data(0)
search_results = initial_results['search-results']
num_results = int(search_results["opensearch:totalResults"])
items_per_page = 25
iterations = math.ceil(num_results / items_per_page)
all_data = collect_all_data(iterations)
save_data_to_csv(all_data)
