import React from 'react';
import { ListItem, ListItemText, IconButton, ListItemAvatar, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import axios from '../services/api';

const TodoItem = ({ todo, fetchTodos, setEditingTodo }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`/todos/${todo._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleEdit = () => {
    setEditingTodo(todo);
  };

  return (
    <ListItem className="todo-item">
      <ListItemAvatar>
        {todo.image ? (
          <Avatar
            variant="square"
            src={todo.image}
            sx={{ width: 56, height: 56 }}
          />
        ) : (
          <Avatar variant="square" sx={{ width: 56, height: 56 }} />
        )}
      </ListItemAvatar>
      <ListItemText
        primary={todo.title}
        secondary={todo.description}
        sx={{ marginRight: '16px' }}
      />
      <div className="action-buttons">
        {todo.files && todo.files.map((file, index) => (
          <IconButton
            edge="end"
            aria-label="download"
            key={index}
            href={file}
            download
            style={{ padding: '4px' }}
          >
            <DownloadIcon />
          </IconButton>
        ))}
        <IconButton edge="end" aria-label="edit" onClick={handleEdit} style={{ padding: '4px' }}>
          <EditIcon />
        </IconButton>
        <IconButton edge="end" aria-label="delete" onClick={handleDelete} style={{ padding: '4px' }}>
          <DeleteIcon />
        </IconButton>
      </div>
    </ListItem>
  );
};

export default TodoItem;
