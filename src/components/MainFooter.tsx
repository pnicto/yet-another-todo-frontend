import { Button, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useGlobalContext } from "../context/appContext";
import { useRef, useState } from "react";
import AddDialog from "./dialogs/AddDialog";

const MainFooter = () => {
  const { globalState, globalDispatch, handleAddComponent } =
    useGlobalContext();
  const { tasksboards, activeTaskboardId } = globalState;

  const changeActiveTaskboard = (tasksboardId: number) => {
    globalDispatch({
      type: "change active taskboard",
      payload: tasksboardId,
    });
  };

  // Refs
  const taskboardRef = useRef<HTMLInputElement>();

  // Dialog actions
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div id="main-footer">
      <Paper square={true} elevation={3}>
        {tasksboards.map((tasksboard) => {
          // Scale the button which shows the active tasksboard.
          if (activeTaskboardId === tasksboard.id) {
            return (
              <Button
                key={tasksboard.id}
                variant="contained"
                color="secondary"
                className="active"
                onClick={() => changeActiveTaskboard(tasksboard.id)}
              >
                {tasksboard.boardTitle}
              </Button>
            );
          } else {
            return (
              <Button
                key={tasksboard.id}
                variant="contained"
                color="secondary"
                onClick={() => changeActiveTaskboard(tasksboard.id)}
              >
                {tasksboard.boardTitle}
              </Button>
            );
          }
        })}
        <Button
          onClick={handleClickOpen}
          color="secondary"
          title="add taskboard"
          variant="contained"
        >
          <AddIcon color="primary" />
        </Button>
        <AddDialog
          dialogLabel="Create a tasksboard"
          dialogTitle="Name"
          fieldRef={taskboardRef}
          handleClose={handleClose}
          handleSubmit={() => {
            const taskboardTitle = taskboardRef.current?.value;
            if (taskboardTitle) {
              return handleAddComponent(taskboardTitle, setOpen, "taskboard");
            }
            throw new Error("taskcard addition");
          }}
          open={open}
        />
      </Paper>
    </div>
  );
};

export default MainFooter;
