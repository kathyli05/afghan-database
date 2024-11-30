const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const dynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

AWS.config.update({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

const dynamoDB = new AWS.DynamoDB();

const params = {
  TableName: dynamoDBTableName,
  AttributeDefinitions: [
    { AttributeName: 'source_name', AttributeType: 'S' }, 
    { AttributeName: 'link', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'source_name', KeyType: 'HASH' },  
    { AttributeName: 'link', KeyType: 'RANGE' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5  
  }
};

dynamoDB.createTable(params, (err, data) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created successfully:', data);
  }
});
