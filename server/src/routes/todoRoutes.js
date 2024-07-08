const express = require('express');
const { check, validationResult } = require('express-validator');
const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getTodos);

router.post('/', upload.fields([{ name: 'image' }, { name: 'files' }]), [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createTodo);

router.put('/:id', upload.fields([{ name: 'image' }, { name: 'files' }]), [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, updateTodo);

router.delete('/:id', deleteTodo);

module.exports = router;
