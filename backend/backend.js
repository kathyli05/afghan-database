const { google } = require('googleapis');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const googleApiKey = process.env.GOOGLE_API_KEY; 
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const dynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

const fields = 'source_name, author, link, date_of_pub, open_access_or_not, associated_orgs, type_of_pub, topics, summary';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

async function writeToDynamoDB(data) {
  try {
    const existingItems = await fetchExistingItemsFromDynamoDB();

    // Filter out items already in DynamoDB
    const newData = data.filter(item =>
      !existingItems.some(existing =>
        existing.source_name === item.source_name &&
        existing.link === item.link
      )
    );

    const uniqueData = [];
    const seenKeys = new Set();

    for (const item of newData) {
      const key = `${item.source_name}-${item.link}`; 

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueData.push(item); 
      }
    }

    if (uniqueData.length === 0) {
      console.log('No new unique data to write.');
      return;
    }


    const chunks = chunkArray(uniqueData, 25);

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
                open_access_or_not: item.open_access_or_not,
                associated_orgs: item.associated_orgs,
                type_of_pub: item.type_of_pub,
                topics: item.topics,
                summary: item.summary
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

// async function synchronizeNewData() {
//   try {
//     const data = await collectAllData();
//     await writeToDynamoDB(data);
//     console.log('Additional data synchronization completed.');
//   } catch (error) {
//     console.error('Error synchronizing data:', error);
//   }
// }

synchronizeData();
