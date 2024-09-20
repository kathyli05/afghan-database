# do pip install httpx openai==0.28 beautifulsoup4 requests pandas
# changes: removed the country of publication field
# added the open_access_or_not field
# TODO: need to add new column to spreadsheet
# TODO: need to insert new data (re-run backend) and delete old data
# TODO: need to change front-end display

import httpx
import openai
import json
import requests
import math
import time
from bs4 import BeautifulSoup
import pandas as pd
from dotenv import load_dotenv
import os

# get scopus and openai api key
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

# Function to fetch data using Scopus API
def fetch_scopus_data(start):
    query = f"?query=((KEY(Afghanistan) OR KEY(Taliban)) AND (KEY(rights) OR KEY('civil liberties') OR KEY('violations') OR KEY('gender') OR KEY('women') OR KEY('governance') OR KEY('UN') OR KEY('security') OR KEY('humanitarian') OR KEY('health'))) AND PUBYEAR > 2021&start={start}&count=25"
    url = f"https://api.elsevier.com/content/search/scopus{query}"
    response = client.get(url)
    return response.json()

def fetch_article(url):
    try:
        # return an empty string in the case of error
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        article_content = soup.get_text().strip()
        if not article_content:
            return ""
        return article_content
    except requests.exceptions.RequestException:
        return ""

# Function to summarize content using OpenAI API
def summarize_content(content, max_retries=3):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Please summarize the following article. Give me the summary only:\n\n{content}"}
            ],
            timeout=30
        )
        summary = response.choices[0].message['content'].strip()
        return summary
    except openai.error.OpenAIError as e:
        print(f"Error summarizing content: {e}")
        if max_retries > 0:
            time.sleep(2 ** (3 - max_retries))
            return summarize_content(content, max_retries - 1)
        return ""

# Function to summarize topics using OpenAI API
def summarize_topics(content, max_retries=3):
    # define the list of topics
    topics_list = [
        "Human Rights", "Genocide", "Gender", "Drugs", "Employment",
        "Apartheid", "Economy", "Security", "Mental Health", "Migration",
        "Peace", "Governance", "International Community", "Humanitarian",
        "Health", "Taliban", "International Governance", "Civil Society",
        "Gender Apartheid", "UN", "Technology", "National Security",
        "Conflict", "Climate", "International Aid"
    ]

    # format the topics into a string for the prompt
    topics_string = "\n".join([f"{i + 1}: {topic}" for i, topic in enumerate(topics_list)])

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": f"Please extract a list of maximum 3 topics from the following article content. Don't give me anything else, just the topics in the form [topic1, topic2]: {content}."
                },
                {
                    "role": "user",
                    "content": f"Here is the list of available topics to choose from:\n{topics_string}"
                }
            ],
            timeout=15 
        )
        topics = response.choices[0].message['content'].strip()
        return topics
    except openai.error.OpenAIError as e:
        print(f"Error summarizing content: {e}")
        if max_retries > 0:
            time.sleep(2 ** (3 - max_retries))
            return summarize_content(content, max_retries - 1)
        return ""

# Function to extract the relevant data from each entry
def extract_data(entry):
    source_name = entry.get('dc:title')
    author = entry.get('dc:creator')
    doi = entry.get('prism:doi')
    source_link = f"https://doi.org/{doi}" if doi else "DOI not available"
    date_of_pub = entry.get('prism:coverDate')
    associated_orgs = [org.get('affilname') for org in entry.get('affiliation', [])]
    type_of_pub = entry.get('subtypeDescription')
    open_access = entry.get('openaccess')

    # summary = 'Not available'
    # topics = ['Not available']

    # if open_access == 0:
    #     open_access_or_not = 'No'
    # else:
    #     open_access_or_not = 'Yes'
    #     article_content = fetch_article(source_link)
    #     if article_content != "":
    #         try:
    #             summary = summarize_content(article_content)
    #             topics = summarize_topics(article_content)
    #             time.sleep(2)
    #         except Exception as e:
    #             print(f"Error occurred during summarization or topic extraction: {e}")
    #             summary = "Not available"
    #             topics = ['Not available']

    print(f"Source Name: {source_name}")
    print(f"Author: {author}")
    print(f"Source Link: {source_link}")
    print(f"Date of Publication: {date_of_pub}")
    print(f"Associated Organizations: {associated_orgs}")
    print(f"Type of Publication: {type_of_pub}")
    print(f"Open Access: {open_access}")
    # print(f"Summary: {summary}")
    # print(f"Topics: {topics}")

    return {
        'source_name': source_name,
        'author': author,
        'link': source_link,
        'date_of_pub': date_of_pub,
        'associated_orgs': associated_orgs,
        'type_of_pub': type_of_pub,
        'open_access_bin': open_access
       #  'topics': topics,
       # 'open_access_or_not': open_access_or_not,
        # 'summary': summary
    }

def collect_all_data(iterations):
    all_data = []
    
    for i in range(iterations):
        start = i * 25
        scopus_data = fetch_scopus_data(start)
        
        if scopus_data and 'search-results' in scopus_data and 'entry' in scopus_data['search-results']:
            entries = scopus_data['search-results']['entry']
            print(f"Number of entries in page {i + 1}: {len(entries)}")
            
            for entry in entries:
                data = extract_data(entry)
                all_data.append(data)
        else:
            print('No entries found in the response.')
    return all_data

# Function to export the data in CSV format
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
