const { v4: uuidv4 } = require('uuid');
const Todo = require('../models/Todo');

exports.getTodos = async (req, res) => {
  const { userId } = req.user;

  try {
    const todos = await Todo.getTodosByUser(userId);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTodo = async (req, res) => {
  const { title, description, tags } = req.body;
  const { userId } = req.user;
  const todoId = uuidv4();

  const newTodo = {
    todoId,
    userId,
    title,
    description,
    tags: tags ? tags.split(',') : [],
    image: req.files['image'] ? req.files['image'][0].location : null,
    files: req.files['files'] ? req.files['files'].map(file => file.location) : [],
  };

  try {
    await Todo.createTodo(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  const { title, description, tags } = req.body;
  const { userId } = req.user;
  const { id: todoId } = req.params;

  const updateParams = {
    title,
    description,
    tags: tags ? tags.split(',') : [],
    image: req.files['image'] ? req.files['image'][0].location : undefined,
    files: req.files['files'] ? req.files['files'].map(file => file.location) : undefined,
  };

  try {
    const updatedTodo = await Todo.updateTodoById(todoId, userId, updateParams);
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  const { userId } = req.user;
  const { id: todoId } = req.params;

  try {
    await Todo.deleteTodoById(todoId, userId);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
