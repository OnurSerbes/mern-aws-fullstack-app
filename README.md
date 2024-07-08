# Full-Stack Todo Application

This is a full-stack Todo application built with React, Node.js, Express, and MongoDB. The application allows users to register, log in, create, update, delete, and filter their to-do tasks. It also supports file uploads to AWS S3.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [MongoDB Setup](#mongodb-setup)
- [AWS Setup](#aws-setup)
- [Contributing](#contributing)
- [License](#license)

## Architecture

The application is divided into two main parts:

- **Client**: Built with React, Material UI, and React Router.
- **Server**: Built with Node.js, Express, MongoDB, and AWS.

## Features

- User authentication (register and login)
- Create, update, delete, and view todos
- Filter todos by tags
- Upload images and files to AWS S3
- Download the attachment of todos
- Protected routes for authenticated users

## Prerequisites

- Node.js
- npm or yarn
- MongoDB
- AWS S3 account (for file uploads)

## Installation

1. **Clone the repository:**

you don't need to clone for now, not uploaded to github, this line is just added for enhance the guide

```sh
git clone https://github.com/OnurSerbes/todo-app.git 
cd todo-app
```

2. **Install dependencies for both client and server:**

```sh
# Install server dependencies
cd server
npm install
npm install dotenv

# Install client dependencies
cd ../client
npm install
```

Running `npm install` in each directory will set up all necessary dependencies specified in the `package.json` files.

## Libraries and Tools Used

### Server-Side Libraries

- **@aws-sdk/client-s3**: AWS SDK for JavaScript for S3.
- **bcryptjs**: Library to hash passwords.
- **cors**: Middleware to enable CORS.
- **dotenv**: Library to load environment variables from a .env file.
- **express**: Web framework for Node.js.
- **jsonwebtoken**: Library to sign and verify JSON Web Tokens.
- **mongoose**: MongoDB object modeling tool.
- **multer**: Middleware for handling file uploads.
- **multer-s3**: Streaming multer storage engine for AWS S3.

### Client-Side Libraries

- **@mui/icons-material**: Material UI icons.
- **@mui/material**: Material UI components.
- **@testing-library/jest-dom**: Custom jest matchers for DOM nodes.
- **@testing-library/react**: Simple and complete React DOM testing utilities.
- **@testing-library/user-event**: Fire events to interact with the UI.
- **axios**: Promise-based HTTP client.
- **react**: JavaScript library for building user interfaces.
- **react-dom**: Entry point to the DOM and server renderers for React.
- **react-router-dom**: Declarative routing for React.
- **react-scripts**: Scripts and configuration used by Create React App.
- **web-vitals**: Library for measuring web performance metrics.

## Environment Variables

Create a `.env` file in the `server` directory and add the following environment variables:

```env
# MongoDB URI
MONGODB_URI=<your-mongodb-uri>

# JWT Secret
JWT_SECRET=<your-jwt-secret>

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
AWS_REGION=<your-aws-region>
S3_BUCKET_NAME=<your-s3-bucket-name>

# Server Port
PORT=5000
```

## Running the Application

1. **Start the server:**

```sh
cd server
npm start
```

2. **Start the client:**

```sh
cd client
npm start
```

The client will be running on `http://localhost:3000` and the server on `http://localhost:5000`.

## API Endpoints

### Auth Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get a JWT token

### Todo Routes

- `GET /api/todos` - Get all todos for the authenticated user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

Understood. Here's the content formatted properly with GitHub README.md syntax:

```markdown
### Database Structure

The application uses MongoDB as its NoSQL database. Below is the structure of the MongoDB collections and the setup guideline:

## MongoDB Setup

### Install MongoDB
Follow the instructions on the [MongoDB installation guide](https://docs.mongodb.com/manual/installation/) to install MongoDB on your system.

### Start MongoDB
Start the MongoDB server by running the following command in your terminal:

```sh
mongod
```

### Create a Database
You can create a database manually using the MongoDB shell:

```sh
mongo
use myTodoApp
```

### Create Indexes Manually

To enable text search functionality, you need to create a text index on the `title` and `description` fields in the `todos` collection manually using the MongoDB shell:

```sh
db.todos.createIndex({ title: "text", description: "text" })
```

### Using MongoDB Atlas UI

You can also perform these steps via MongoDB Atlas UI.

#### Create a Database
1. Navigate to your MongoDB Atlas cluster.
2. Click on "Collections" and then "Create Database".
3. Enter `myTodoApp` as the database name and `todos` as the collection name.

#### Create Indexes in MongoDB Atlas

To enable text search functionality, you need to create a text index on the `title` and `description` fields in the `todos` collection:

1. Navigate to the `Indexes` tab for the `test.todos` collection.
2. Click on the "CREATE INDEX" button.
3. Fill in the index fields with the following JSON:
   ```json
   {
     "title": "text",
     "description": "text"
   }
   ```
4. Click on "Review" and then "Create Index" to finalize the creation of the index.

### Collections

#### Users Collection (`test.users`)
- `_id`: ObjectId
- `username`: String
- `password`: String (hashed)

#### Todos Collection (`test.todos`)
- `_id`: ObjectId
- `userId`: ObjectId (reference to the user)
- `title`: String
- `description`: String
- `tags`: Array of Strings
- `image`: String (URL to the image in S3)
- `files`: Array of Strings (URLs to the files in S3)
- `createdAt`: Date
- `updatedAt`: Date

## AWS Setup

### IAM and S3 Configuration

For AWS usage, IAM and S3 services are utilized:

- **IAM**: 
  - Created a group called `admin1` and added a user called `developer`.
  - Generated access key and secret key for the `developer` user to enhance security.
  - This setup prevents direct usage of the root user account, ensuring a hierarchical and secure structure.

- **S3**:
  - Used for general storage options for files and images.
  - All files and images uploaded by users are stored in an S3 bucket named `mytestcasebucket`.

### Security Measures

- The `developer` IAM user has limited permissions as compared to the root user, ensuring that the root account details remain secure.
- Using IAM roles and policies, access to the S3 bucket is managed securely.

