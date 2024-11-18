import pandas as pd
import openai
import requests
import time
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import os
from pydantic import BaseModel
from openai import OpenAI
from newspaper import Article
from newspaper.article import ArticleException

load_dotenv()
openai_api_key = os.getenv("OPEN_AI_API")
file_path = 'scopus_data.csv'
initial_df = pd.read_csv(file_path)

def fetch_article(url):
    try:
        # Attempt to download and parse the article
        article = Article(url)
        article.download()
        article.parse()
        
        # Retrieve article content
        article_content = article.text
        if not article_content:
            return ""
        return article_content
    
    except ArticleException as e:
        print(f"Article download failed: {e}")
        return ""  
    except requests.exceptions.RequestException as req_err:
        print(f"Request failed: {req_err}")
        return "" 

client = OpenAI(
    api_key=openai_api_key,
)
def summarize_content(content, max_retries=3):
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": (
                    "Please summarize the following article. Include the following points in the summary:\n\n"
                    "1. A brief overview of any relevant historical, political, or social context\n"
                    "2. The purpose of the research and the specific human rights questions or challenges it addresses\n"
                    "3. A summary of the research methods used\n"
                    "4. Main findings, particularly any specific human rights violations, or trends\n"
                    "5. If applicable, summarize any examination of the country's legal frameworks, institutions, and policies related to human rights\n"
                    "6. A summary of the authors' conclusions and any recommendations\n"
                    "7. Any limitations of the study, especially those related to the country's political climate, data availability, or the sensitivity of human rights\n\n"
                    f"Article:\n{content}"
                )}
            ],
            timeout=30
        )
        print(response)
        if hasattr(response, 'choices') and response.choices:
            message = response.choices[0].message
            if hasattr(message, 'content') and message.content:
                summary = message.content.strip()
                return summary
            else:
                print("No content found in the message.")
                return "not available"
        else:
            print("Unexpected response structure or empty choices.")
            return "not available"
    except openai.APIError as e:
        print(f"Error summarizing content: {e}")
        if max_retries > 0:
            time.sleep(2 ** (3 - max_retries))
            return summarize_content(content, max_retries - 1)
        return "Not available"

class TopicsFormat(BaseModel):
    main_themes: list[str]
    sub_themes: list[str]

# Function to summarize topics using OpenAI API
def summarize_topics(content, max_retries=3):
    # define the structured list of main themes and sub-themes
    themes_structure = {
        "Governance": ["Civil Society", "International Community", "Policy Reform"],
        "Security and Conflict": ["Veterans", "Peace Initiatives", "Military Actions"],
        "Human Rights": ["Gender", "Gender Apartheid", "Freedom of Speech", "Civil Liberties"],
        "Education": ["Higher Education", "School Access", "Literacy Programs"],
        "Economy and Infrastructure": ["Employment", "Agriculture", "Natural Resources", "Financial Inclusion"],
        "Healthcare and Public Health": ["Nutrition", "COVID-19", "Disease Prevention", "Maternal Health"],
        "Humanitarian and Development Assistance": ["Disaster Risk Reduction", "Migration", "Food Security", "Energy Security"],
        "Culture, Society, and Heritage": ["Art", "Culture", "Religion", "Traditional Practices"],
        "Environment": ["Climate", "Sustainability", "Conservation", "Biodiversity"],
        "Technology": ["Digital Technology", "Agricultural Technology", "Renewable Energy", "Tech Innovation"]
    }

    # format the main themes and sub-themes into a string for the prompt
    themes_string = "\n".join([f"{main_theme}: {', '.join(sub_themes)}" for main_theme, sub_themes in themes_structure.items()])

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": f"Analyze the provided article content and select 2-3 main themes from the sections below. For each chosen main theme, select 1-2 relevant sub-themes as appropriate. Return the response in the format specified below.\n\nArticle content:\n{content}\n\nSections with Main Themes and Sub-themes:\n{themes_string}\n\nInstruction: Select and return 1-2 main themes from the sections above and, for each chosen main theme, 1-2 relevant sub-themes (either from the provided list or other appropriate sub-themes). Please return the response formatted as follows:\n\n---\n\nOutput Format:\n\n- Main Themes:\n  - [Main Theme 1]\n  - [Main Theme 2] (if applicable)\n\n- Sub-themes:\n  - [Sub-theme(s) for Main Theme 1]\n  - [Sub-theme(s) for Main Theme 2] (if applicable)"
                }
            ],
            response_format=TopicsFormat,
            timeout=15
        )
        topics = response.choices[0].message.parsed
        return topics
    except openai.error.OpenAIError as e:
        print(f"Error summarizing topics: {e}")
        if max_retries > 0:
            time.sleep(2 ** (3 - max_retries))
            return summarize_topics(content, max_retries - 1)
        return "Not available"


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
                initial_df.at[row.name, 'main_topics'] = summarize_topics(article_content).main_themes
                initial_df.at[row.name, 'sub_topics'] = summarize_topics(article_content).sub_themes
                time.sleep(2)
            except openai.APIError as e:
                print(f"Error occurred during summarization or topic extraction: {e}")
                initial_df.at[row.name, 'summary'] = 'Not available'
                initial_df.at[row.name, 'topics'] = ['Not available']
        else:
            initial_df.at[row.name, 'summary'] = 'Not available'
            initial_df.at[row.name, 'topics'] = ['Not available']
    print(f"Finished extracting summary and topics for row {row.name}")

# Specify the range of rows to process
start_row = 1 #
end_row =  760 #  End at row 759

# Apply the function to the specific range of rows
if 'open_access_or_not' not in initial_df.columns:
    initial_df['open_access_or_not'] = None
if 'main_topics' not in initial_df.columns:
    initial_df['main_topics'] = None
if 'sub_topics' not in initial_df.columns:
    initial_df['sub_topics'] = None
initial_df.iloc[start_row:end_row].apply(process_row, axis=1)

# Save the updated DataFrame back to the same CSV
initial_df.to_csv(file_path, index=False)

print(f"Processed rows {start_row} to {end_row - 1} and saved to {file_path}")

