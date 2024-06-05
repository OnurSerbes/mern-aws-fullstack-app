const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TableName = 'users';

class User {
  static async getUserByUsername(username) {
    const params = {
      TableName,
      IndexName: 'username-index', // Ensure an index on the username
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    };
    console.log('Getting user by username with params:', params);
    try {
      const { Items } = await ddbDocClient.send(new QueryCommand(params));
      return Items[0]; // Assuming usernames are unique
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  static async createUser(user) {
    const params = {
      TableName,
      Item: user
    };
    console.log('Creating user with params:', params);
    try {
      await ddbDocClient.send(new PutCommand(params));
      console.log('User successfully created:', user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    const params = {
      TableName
    };
    try {
      const data = await ddbDocClient.send(new ScanCommand(params));
      console.log('All users:', data.Items);
      return data.Items;
    } catch (error) {
      console.error('Error scanning users:', error);
      throw error;
    }
  }
}

module.exports = User;
