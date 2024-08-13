const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const { prototype } = require('aws-sdk/clients/cloudformation');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 10000;

console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);

// Configure AWS SDK with credentials and region from environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const allowedOrigins = process.env.NODE_ENV === 'production' ? 'https://afghan-database-1.onrender.com' : '*';

app.use(cors({
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
}));

const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableName = 'afghanistan-database'; // CHANGE NAME LATER
const fields = 'source_name, author, link, date_of_pub, country_of_publication, associated_orgs, type_of_pub, topics, summary';
// CHANGE NAME LATER

const getDataFromDynamoDB = async (tableName, fields) => {
  const params = {
    TableName: tableName,
    ProjectionExpression: fields,
  };
  let items;
  // Scan is the operation that returns all items within a table
  do {
    console.log('Scanning DynamoDB with params:', params);
    items = await dynamodb.scan(params).promise();
    if (items && items.Items) {
        console.log('Number of items retrieved:', items.Items.length); 
      } else {
        console.log('No items found in scan result');
    }
    console.log('Scan result:', items);
    params.ExclusiveStartKey = items.LastEvaluatedKey;
    // Use a while loop in case the table is large and there are more items to be scanned
    } while (items.ExclusiveStartKey != undefined);
  return items;
}

// API endpoint to get data from DynamoDB
app.get('/data', async (req, res) => {
  try {
    const data = await getDataFromDynamoDB(tableName, fields);
    console.log('Sending response with data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data:', error); 
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
