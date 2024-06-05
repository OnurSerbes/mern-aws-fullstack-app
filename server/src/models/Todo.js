const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

class Todo {
  static async getTodosByUser(userId) {
    const params = {
      TableName: 'todos',
      IndexName: 'userId-todoId-index', // Replace with your actual index name
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    console.log('Getting todos with params:', params);

    try {
      const data = await ddbDocClient.send(new QueryCommand(params));
      return data.Items;
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  }

  static async createTodo(todo) {
    const params = {
      TableName: 'todos',
      Item: todo
    };

    console.log('Creating todo with params:', params);

    try {
      await ddbDocClient.send(new PutCommand(params));
      console.log('Todo successfully created:', todo);
      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  static async updateTodoById(todoId, userId, updateParams) {
    const updateExpression = [];
    const expressionAttributeValues = {};

    for (const key in updateParams) {
      if (updateParams[key] !== undefined) {
        updateExpression.push(`${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = updateParams[key];
      }
    }

    const params = {
      TableName: 'todos',
      Key: {
        todoId,
        userId
      },
      UpdateExpression: `set ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const data = await ddbDocClient.send(new UpdateCommand(params));
      return data.Attributes;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  static async deleteTodoById(todoId, userId) {
    const params = {
      TableName: 'todos',
      Key: {
        todoId,
        userId
      }
    };

    try {
      await ddbDocClient.send(new DeleteCommand(params));
      return { message: 'Todo deleted successfully' };
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}

module.exports = Todo;
