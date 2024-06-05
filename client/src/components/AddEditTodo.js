import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "../services/api";

const AddEditTodo = ({ fetchTodos, editingTodo, setEditingTodo }) => {
  const [open, setOpen] = useState(false);
  const [todo, setTodo] = useState({
    userId: localStorage.getItem("userId") || "",
    title: "",
    description: "",
    tags: "",
    image: "",
    files: [],
  });
  const [imagePath, setImagePath] = useState("");
  const [filesPath, setFilesPath] = useState([]);

  useEffect(() => {
    if (editingTodo) {
      setTodo({
        ...editingTodo,
        tags: editingTodo.tags.join(", "), // Convert array to comma-separated string
        files: editingTodo.files, // Keep as array for upload
      });
      setImagePath(editingTodo.image || "");
      setFilesPath(editingTodo.files || []);
      setOpen(true);
    }
  }, [editingTodo]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTodo(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTodo({
      ...todo,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTodo({
          ...todo,
          image: reader.result,
        });
        setImagePath(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      const readerPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises).then((results) => {
        setTodo({
          ...todo,
          files: results,
        });
        setFilesPath(files.map((file) => file.name));
      });
    }
  };

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

      console.log("Todo saved:", response.data);

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

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {editingTodo ? "Edit Todo" : "Add Todo"}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingTodo ? "Edit Todo" : "Add Todo"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={todo.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            value={todo.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="tags"
            label="Tags (comma-separated)"
            type="text"
            fullWidth
            value={todo.tags}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            component="label"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>
          {imagePath && (
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={imagePath} />
              </ListItem>
            </List>
          )}
          <Button
            variant="contained"
            component="label"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Files
            <input
              type="file"
              accept="*"
              hidden
              multiple
              onChange={handleFilesUpload}
            />
          </Button>
          {filesPath.length > 0 && (
            <List>
              {filesPath.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={file} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddEditTodo;
