# Project Overview

This project is a full-stack application that utilizes AWS services for backend operations and a React frontend. The application allows users to register, log in, and manage their todos, including adding, editing, and deleting todo items. Authentication is handled using AWS Cognito, and data is stored in DynamoDB.

## Features

- User registration and login with AWS Cognito.
- CRUD operations for todo items.
- Secure storage of todo items in DynamoDB.
- Integration with AWS Lambda functions for backend logic.
- React frontend for user interaction.
- Logging with AWS CloudWatch.
- Secure APIs with AWS API Gateway and IAM policies.
- Simplified development and deployment with AWS Amplify.

## Prerequisites

- Node.js
- AWS CLI
- An AWS account with permissions to create Cognito user pools, Lambda functions, DynamoDB tables, and configure IAM roles.

## Setup

### 1. Clone the Repository

```sh
git clone https://github.com/mern-aws-todo-app.git
cd client
```

Application is performing serverless, nodejs(server) segment is for server based architecture. No need to deep dive for now

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure AWS Resources

#### AWS Cognito User Pool

1. Create a new user pool in AWS Cognito.
2. Configure the user pool with the following settings:
   - Sign-in options: Username.
   - Password policy: At least 8 characters, including numbers, special characters, uppercase and lowercase letters.
   - Multi-factor authentication: Disabled.
   - User account recovery: Disabled.
   - Self-service sign-up: Disabled.
   - Hosted UI: Disabled.
3. Create an app client with the following settings:
   - App type: Public client.
   - Authentication flow: Enable `USER_PASSWORD_AUTH`.
4. Note the User Pool ID and App Client ID.

#### DynamoDB Table

1. Create a new table named `todos` with the following schema:
   - Partition key: `todoId` (String)
   - Sort key: `userId` (String)

#### AWS Lambda Functions

1. Create Lambda functions for `loginUser`, `registerUser`, `createTodo`, and `deleteTodo`. For authentication, `loginUser`, and `registerUser` with the implementation of AWS Cognito
2. Assign the necessary IAM roles and policies to each Lambda function:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonCognitoPowerUser`
   - Custom DynamoDB policies for CRUD operations.

### 4. Set Environment Variables

Set the following environment variables in your Lambda functions:

- `JWT_SECRET`: Your JWT secret key.
- `AWS_REGION`: Your AWS region.
- `COGNITO_CLIENT_ID`: Your Cognito App Client ID.
- `COGNITO_USER_POOL_ID`: Your Cognito User Pool ID.

### 5. Deploy the Frontend

```sh
npm run build
# Deploy the build folder to your preferred hosting service (e.g., S3, Netlify, Vercel).
```

### 6. Update API Endpoints

Ensure your frontend code points to the correct API Gateway endpoints for your Lambda functions.

## AWS Amplify

AWS Amplify is used to simplify the development and deployment process. Amplify provides tools and services to develop, build, and deploy the application quickly and securely. It handles the configuration of backend resources and helps manage authentication, storage, APIs, and more.

## IAM Policies

IAM policies are configured to ensure secure access to AWS resources. Each Lambda function has an associated IAM role with the least privilege principle applied, allowing only necessary actions:

- `AWSLambdaBasicExecutionRole`: Provides basic Lambda execution permissions.
- `AmazonCognitoPowerUser`: Allows full access to Cognito user pools.
- Custom DynamoDB policies: Allow specific CRUD operations on the `todos` table.

## AWS CloudWatch

CloudWatch is used for logging and monitoring the Lambda functions. It provides real-time insights into the application's performance and helps in debugging issues by logging the events and errors.

## API Gateway

AWS API Gateway is used to create, publish, maintain, monitor, and secure APIs. It acts as a "front door" for the Lambda functions, enabling secure access and invocation.

### Authentication

All API endpoints are secured using JWT tokens provided by AWS Cognito. The tokens are validated in the Lambda functions to ensure only authenticated users can access the resources.

## Lambda Functions

### loginUser

Handles user authentication using AWS Cognito.

```js
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const bcrypt = require("bcryptjs");
const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const { username, password } = JSON.parse(event.body);
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        token: response.AuthenticationResult.IdToken,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid credentials" }),
    };
  }
};
```

### registerUser

Handles user registration using AWS Cognito.

```js
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const { username, password } = JSON.parse(event.body);
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: username,
    Password: password,
  };
  try {
    const command = new SignUpCommand(params);
    await cognitoClient.send(command);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Could not register user" }),
    };
  }
};
```

### createTodo

Handles the creation of todo items and stores them in DynamoDB.

```js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const body = JSON.parse(event.body);
  const { userId, title, description, tags, image, files } = body;

  if (!userId || !title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "userId and title are required" }),
    };
  }

  const todoId = uuidv4();
  const params = {
    TableName: "todos",
    Item: {
      todoId: todoId,
      userId: userId,
      title: title,
      description: description,
      tags: tags,
      image: image,
      files: files,
    },
  };

  try {
    const command = new PutCommand(params);
    await ddbDocClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Todo created successfully", todoId }),
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create todo" }),
    };
  }
};
```

### deleteTodo

Handles the deletion of todo items from DynamoDB.

```js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DeleteCommand,
  DynamoDBDocumentClient,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const { todoId } = JSON.parse(event.body);

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "todoId is required" }),
    };
  }

  const params = {
    TableName: "todos",
    Key: { todoId: todoId },
  };

  try {
    const command = new DeleteCommand(params);
    await ddbDocClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Todo deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete todo" }),
    };
  }
};
```

## API Gateway Configuration

### POST /auth/login

- Integration Request Mapping Template:

  ```json


  {
    "body": $input.json('$')
  }
  ```

### POST /auth/register

- Integration Request Mapping Template:
  ```json
  {
    "body": $input.json('$')
  }
  ```

### POST /todos

- Integration Request Mapping Template:
  ```json
  {
    "body": $input.json('$')
  }
  ```

### DELETE /todos/{todoId}

- Integration Request Mapping Template:
  ```json
  {
    "body": {},
    "todoId": "$input.params('todoId')"
  }
  ```

## Frontend Configuration

### AddEditTodo.js

Ensure that the `tags` field is correctly handled when creating or editing a todo:

```js
const handleSave = async () => {
  const tagsArray = todo.tags.split(",").map((tag) => tag.trim());
  const payload = { ...todo, tags: tagsArray };

  try {
    const response = await axios.post("/todos", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      fetchTodos();
      handleClose();
    } else {
      throw new Error(response.data.error || "Unknown error");
    }
  } catch (error) {
    console.error("Error saving todo:", error);
  }
};
```

### TodoItem.js

Ensure that the delete functionality is correctly handled:

```js
const handleDelete = async () => {
  try {
    const response = await axios.delete(`/todos/${todo.todoId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    fetchTodos();
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
};
```

## Usage

### Register

```sh
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/auth/register -H "Content-Type: application/json" -d '{"username": "your-username", "password": "your-password"}'
```

### Login

```sh
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/auth/login -H "Content-Type: application/json" -d '{"username": "your-username", "password": "your-password"}'
```

### Create Todo

```sh
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/todos -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"userId": "your-user-id", "title": "your-title", "description": "your-description", "tags": ["tag1", "tag2"], "image": "your-image-data", "files": ["file1-data", "file2-data"]}'
```

### Delete Todo

```sh
curl -X DELETE https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/todos/<todoId> -H "Content-Type: application/json" -H "Authorization: Bearer <token>"
```

By following this documentation, you can set up and run the full-stack application seamlessly, ensuring secure and efficient operations
