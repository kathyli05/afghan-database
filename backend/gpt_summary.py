import pandas as pd
import openai
import requests
import time
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import os

load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API")
file_path = 'scopus_data.csv'
initial_df = pd.read_csv(file_path)

# Function to fetch article content based on URL
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

# Function to process each row
def process_row(row):
    if row['open_access_bin'] == 0:
        initial_df.at[row.name, 'open_access_or_not'] = 'No'
        initial_df.at[row.name, 'summary'] = 'Not available'
        initial_df.at[row.name, 'topics'] = ['Not available']
    else:
        initial_df.at[row.name, 'open_access_or_not'] = 'Yes'
        article_content = fetch_article(row['link'])
        if article_content != "":
            try:
                initial_df.at[row.name, 'summary'] = summarize_content(article_content)
                initial_df.at[row.name, 'topics'] = summarize_topics(article_content)
                time.sleep(2)
            except Exception as e:
                print(f"Error occurred during summarization or topic extraction: {e}")
                initial_df.at[row.name, 'summary'] = 'Not available'
                initial_df.at[row.name, 'topics'] = ['Not available']
        else:
            initial_df.at[row.name, 'summary'] = 'Not available'
            initial_df.at[row.name, 'topics'] = ['Not available']
    print(f"Finished extracting summary and topics for row {row.name}")

# Specify the range of rows to process
start_row = 350 #
end_row = 370  #  End at row 731

# Apply the function to the specific range of rows
initial_df.iloc[start_row:end_row].apply(process_row, axis=1)

# Save the updated DataFrame back to the same CSV
initial_df.to_csv(file_path, index=False)

print(f"Processed rows {start_row} to {end_row - 1} and saved to {file_path}")

