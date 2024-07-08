const Todo = require('../models/Todo');
const { validationResult } = require('express-validator');

exports.getTodos = async (req, res) => {
  const { page = 1, limit = 10, searchTerm = '' } = req.query; // Default to page 1, limit 10, and no search term

  const query = { userId: req.user.userId };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  try {
    const todos = await Todo.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Todo.countDocuments(query);

    res.json({
      todos,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, tags } = req.body;
  const userId = req.user.userId;

  try {
    const newTodo = new Todo({
      userId,
      title,
      description,
      tags: tags ? tags.split(',') : [],
      image: req.files['image'] ? req.files['image'][0].location : null, // Use S3 URL
      files: req.files['files'] ? req.files['files'].map(file => file.location) : [], // Use S3 URLs
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error); // Log full error details
    res.status(500).json({ error: 'Failed to create the to-do. Please try again.', details: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, tags } = req.body;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        tags: tags ? tags.split(',') : [],
        image: req.files['image'] ? req.files['image'][0].location : undefined, // Use S3 URL
        files: req.files['files'] ? req.files['files'].map(file => file.location) : undefined, // Use S3 URLs
      },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update the to-do. Please try again.' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
