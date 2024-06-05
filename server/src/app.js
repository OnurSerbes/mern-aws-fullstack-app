const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

console.log('Server configured to use DynamoDB');

module.exports = app;
