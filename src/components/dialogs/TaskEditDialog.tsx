import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useTaskcardContext } from "../../context/taskcardContext";
import { TaskitemInterface } from "../../interfaces/interfaces";

interface Props {
  open: boolean;
  handleClose: () => void;
  task: TaskitemInterface;
}

const TaskEditMenu = ({ open, handleClose, task }: Props) => {
  const { title, id, description } = task;
  const [currentTaskTitle, setCurrentTaskTitle] = useState(title);
  const [currentTaskDescription, setCurrentTaskDescription] =
    useState(description);
  const { tasks, setTasks } = useTaskcardContext();

  const handleSubmit = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/tasks/${id}`;
    const patchBody = {
      taskTitle: currentTaskTitle,
      description: currentTaskDescription,
    };
    await axios.patch(url, patchBody);
    const updatedTasks = tasks.map((taskItem) => {
      if (taskItem.id === id) {
        taskItem.title = currentTaskTitle;
        taskItem.description = currentTaskDescription;
      }
      return taskItem;
    });
    setTasks(updatedTasks);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Task</DialogTitle>
      <form
        onSubmit={(event) => {
          handleClose();
          event.preventDefault();
          handleSubmit();
        }}
      >
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            value={currentTaskTitle}
            fullWidth
            variant="standard"
            label="Task"
            id="task"
            onChange={(event) => {
              setCurrentTaskTitle(event.target.value);
            }}
          />
          <TextField
            margin="dense"
            value={currentTaskDescription ?? ""}
            fullWidth
            variant="standard"
            label="Description"
            id="description"
            multiline
            rows={2}
            onChange={(event) => {
              setCurrentTaskDescription(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Make changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskEditMenu;
