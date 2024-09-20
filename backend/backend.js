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

// const totalResults = 724; 
// const itemsPerPage = 25;
// const iterations = Math.ceil(totalResults / itemsPerPage);
// const apiKey = "e740038482a686bc29db20dce37533b6"; 

const fields = 'source_name, author, link, date_of_pub, open_access_or_not, associated_orgs, type_of_pub, topics, summary';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

// async function fetchDataFromGoogleSheets() {
//   try {
//     const sheets = google.sheets({ version: 'v4', auth: googleApiKey });
//     const spreadsheetId = '18_fX8MBotdalCj2MQ4Qb7gcGUujaMGXfSCzPeIR8lIA';
//     const range = 'Re-organized!A2:I';

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range,
//       key: googleApiKey,
//     });

//     const rows = response.data.values;

//     if (!rows || rows.length === 0) {
//       console.log('No data found.');
//       return [];
//     } else {
//       const data = rows.map(row => ({
//         source_name: row[0],
//         author: row[1].split(',').map(author => author.trim()), 
//         link: row[2],
//         date_of_pub: row[3],
//         country_of_publication: row[4],
//         associated_orgs: row[5].split(',').map(org => org.trim()), 
//         type_of_pub: row[6].split(',').map(pub => pub.trim()), 
//         topics: row[7].split(',').map(topic => topic.trim()), 
//         summary: row[8]
//       }));
//       console.log('Transformed data:', JSON.stringify(data, null, 2)); 
//       return data;
//     }
//   } catch (error) {
//     console.error('Error fetching data from Google Sheets:', error);
//     throw error;
//   }
// }

// async function fetchDataFromScopus(start) {
//   const query = `?query=((KEY(Afghanistan) OR KEY(Taliban)) AND (KEY(rights) OR KEY('civil liberties') OR KEY('violations') OR KEY('gender') OR KEY('women') OR KEY('governance') OR KEY('UN') OR KEY('security') OR KEY('humanitarian') OR KEY('health'))) AND PUBYEAR > 2021&start=${start}`;
//   const url = `https://api.elsevier.com/content/search/scopus${query}`;

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'X-ELS-APIKey': apiKey,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching data from Scopus:', error);
//     return null;
//   }
// }

// // // Function to extract relevant data from each entry
// // function extractData(entry) {
//   const source_name = entry['dc:title'];
//   const author = entry['dc:creator'];
//   const doi = entry['prism:doi'];
//   const source_link = doi ? `https://doi.org/${doi}` : "DOI not available";
//   const date_of_pub = entry['prism:coverDate'];
//   const country_of_publication = "US"; // Placeholder
//   const associated_orgs = (entry.affiliation || []).map(org => org['affilname']);
//   const type_of_pub = entry['subtypeDescription'];
//   // const open_access = entry['openaccess'];
//   const summary = 'not available'; // Placeholder
//   const topics = ['topic1', 'topic2']; // Placeholder for topics

//   return {
//     source_name,
//     author,
//     link: source_link,
//     date_of_pub,
//     country_of_publication,
//     associated_orgs,
//     type_of_pub,
//     topics,
//     summary,
//   };
// }

// // Function to collect data across all pages
// async function collectAllData() {
//   const allData = [];
  
//   for (let i = 0; i < iterations; i++) {
//     const start = i * itemsPerPage;
//     const responseData = await fetchDataFromScopus(start);
    
//     if (responseData && responseData['search-results'] && responseData['search-results'].entry) {
//       const entries = responseData['search-results'].entry;
//       console.log(`Number of entries in page ${i + 1}: ${entries.length}`);
      
//       entries.forEach(entry => {
//         const data = extractData(entry);
//         allData.push(data);
//       });
//     } else {
//       console.log('No entries found in the response.');
//     }
//   }
  
//   return allData;
// }


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
                // CHANGED
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
