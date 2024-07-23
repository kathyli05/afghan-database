const { google } = require('googleapis');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const googleApiKey = process.env.GOOGLE_API_KEY; 
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const dynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

const fields = 'source_name, author, link, date_of_pub, country_of_publication, associated_orgs, type_of_pub, topics, summary';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

async function fetchDataFromGoogleSheets() {
  try {
    const sheets = google.sheets({ version: 'v4', auth: googleApiKey });
    const spreadsheetId = '18_fX8MBotdalCj2MQ4Qb7gcGUujaMGXfSCzPeIR8lIA';
    const range = 'Re-organized!A2:I';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      key: googleApiKey,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return [];
    } else {
      const data = rows.map(row => ({
        source_name: row[0],
        author: row[1].split(',').map(author => author.trim()), 
        link: row[2],
        date_of_pub: row[3],
        country_of_publication: row[4],
        associated_orgs: row[5].split(',').map(org => org.trim()), 
        type_of_pub: row[6].split(',').map(pub => pub.trim()), 
        topics: row[7].split(',').map(topic => topic.trim()), 
        summary: row[8]
      }));
      console.log('Transformed data:', JSON.stringify(data, null, 2)); 
      return data;
    }
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

async function writeToDynamoDB(data) {
  try {
    const existingItems = await fetchExistingItemsFromDynamoDB();
    const newData = data.filter(item =>
      !existingItems.some(existing =>
        existing.source_name === item.source_name &&
        existing.link === item.link
      )
    );

    if (newData.length === 0) {
      console.log('No new data to write.');
      return;
    }

    const chunks = chunkArray(newData, 25);

    for (const chunk of chunks) {
      const batchWriteParams = {
        RequestItems: {
          [dynamoDBTableName]: chunk.map(item => ({
            PutRequest: {
              Item: {
                source_name: item.source_name,
                author: item.author,
                link: item.link,
                date_of_pub: item.date_of_pub,
                country_of_publication: item.country_of_publication,
                associated_orgs: item.associated_orgs,
                type_of_pub: item.type_of_pub,
                topics: item.topics,
                summary: item.summary,
              }
            }
          }))
        }
      };
      const result = await dynamoDB.batchWrite(batchWriteParams).promise();
      console.log('Batch write result:', result);
    }

  } catch (error) {
    console.error('Error writing to DynamoDB:', error);
    throw error;
  }
}

function chunkArray(array, size) {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
}

async function fetchExistingItemsFromDynamoDB() {
  try {
    const params = {
      TableName: dynamoDBTableName,
      ProjectionExpression: fields
    };

    const response = await dynamoDB.scan(params).promise();
    return response.Items;

  } catch (error) {
    console.error('Error fetching existing items from DynamoDB:', error);
    throw error;
  }
}

async function synchronizeData() {
  try {
    const data = await fetchDataFromGoogleSheets();
    await writeToDynamoDB(data);
    console.log('Data synchronization completed.');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  }
}

synchronizeData();
