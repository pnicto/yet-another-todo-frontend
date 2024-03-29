import { AddCircle, MoreVert } from "@mui/icons-material";
import { Card, IconButton, List } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../context/appContext";
import { TaskcardInterface, TaskitemInterface } from "../interfaces/interfaces";
import AddDialog from "./dialogs/AddDialog";
import OptionsMenu from "./menus/OptionsMenu";
import Taskitem from "./Taskitem";
import { TaskcardProvider } from "../context/taskcardContext";
import { errorCodes } from "../interfaces/errors";

type Props = {
  taskcard: TaskcardInterface;
};

const Taskcard = ({ taskcard }: Props) => {
  const [tasks, setTasks] = useState<TaskitemInterface[]>([]);
  const { globalDispatch, globalState } = useGlobalContext();
  const { isShared } = globalState;

  const deleteTaskcard = async (taskcardId: number) => {
    const url = `${import.meta.env.VITE_APP_API_URL}/taskcards/${taskcardId}`;
    try {
      await axios.delete(url);
      globalDispatch({
        type: "delete taskcard",
        payload: taskcardId,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === errorCodes.networkError) {
        globalDispatch({
          type: "update snackbar",
          payload: {
            message: "Could not delete taskcard",
            severity: "error",
          },
        });
      }
    }
  };

  const handleAddTask = async () => {
    const taskToBeAdded = taskRef.current?.value;
    if (taskToBeAdded) {
      const postBody = {
        taskTitle: taskToBeAdded,
      };
      const url = `${import.meta.env.VITE_APP_API_URL}/tasks/${taskcard.id}`;
      try {
        const postResponse = await axios.post(url, postBody);
        const newTask = postResponse.data;
        setTasks([...tasks, newTask]);
        setIsAddDialogOpen(false);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.code === errorCodes.networkError
        ) {
          globalDispatch({
            type: "update snackbar",
            payload: {
              message: "Could not create new task",
              severity: "error",
            },
          });
        }
      }
    } else {
      setIsAddDialogOpen(true);
      globalDispatch({
        type: "update snackbar",
        payload: {
          message: "task title cannot be empty",
          severity: "error",
        },
      });
    }
  };

  const handleRenameList = async (newListTitle: string) => {
    if (newListTitle) {
      const url = `${import.meta.env.VITE_APP_API_URL}/taskcards/${
        taskcard.id
      }`;
      try {
        await axios.patch(url, {
          cardTitle: newListTitle,
        });
        globalDispatch({
          type: "update taskcard",
          payload: { newListTitle, taskcardId: taskcard.id },
        });
        globalDispatch({
          type: "update snackbar",
          payload: {
            message: "New taskcard created",
            severity: "success",
          },
        });
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.code === errorCodes.networkError
        ) {
          globalDispatch({
            type: "update snackbar",
            payload: {
              message: "Could not rename task",
              severity: "error",
            },
          });
        }
      }
    }
  };

  // Menu actions
  // https://mui.com/material-ui/react-menu/
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  // Refs
  const taskRef = useRef<HTMLInputElement>();
  const taskcardRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const fetchAllTasks = async () => {
      const url = `${import.meta.env.VITE_APP_API_URL}/tasks/${taskcard.id}`;
      try {
        const getResponse = await axios.get(url);
        const responseData: TaskitemInterface[] = getResponse.data;
        if (getResponse.status === 200) {
          setTasks(responseData);
        }
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.code === errorCodes.networkError
        ) {
          globalDispatch({
            type: "update snackbar",
            payload: {
              message:
                "Something went wrong with the network. Could not fetch all tasks",
              severity: "error",
            },
          });
        }
      }
    };
    fetchAllTasks();
  }, [globalDispatch, taskcard.id]);

  // Dialog actions
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const handleDialogOpen = () => {
    setIsAddDialogOpen(true);
  };
  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <Card className="taskcard" elevation={3}>
      <div className="card-header">
        <h4 className="card-title">{taskcard.cardTitle}</h4>
        {
          // If shared make it view only
          !isShared && (
            <div className="card-buttons">
              <IconButton onClick={handleDialogOpen}>
                <AddCircle color="primary" />
              </IconButton>

              {/* Visit add dialog file for info */}
              <AddDialog
                dialogLabel="Add a task"
                dialogTitle="Task"
                fieldRef={taskRef}
                handleClose={handleDialogClose}
                handleSubmit={handleAddTask}
                open={isAddDialogOpen}
              />

              {/* Icon button for more options */}
              <IconButton aria-label="more card actions" onClick={openMenu}>
                <MoreVert />
              </IconButton>

              {/* Visit options menu for info */}
              <OptionsMenu
                anchorEl={anchorEl}
                closeMenu={closeMenu}
                open={isMenuOpen}
                component="list"
                fieldRef={taskcardRef}
                deleteAction={() => {
                  deleteTaskcard(taskcard.id);
                }}
                renameAction={() => {
                  const newListTitle = taskcardRef.current?.value;
                  if (newListTitle) {
                    handleRenameList(newListTitle);
                  }
                }}
              />
            </div>
          )
        }
      </div>

      {/* Provider for List to manipulate the tasks as required*/}
      <TaskcardProvider tasks={tasks} setTasks={setTasks}>
        <List>
          {tasks.map((task) => {
            return <Taskitem key={task.id} task={task} />;
          })}
        </List>
      </TaskcardProvider>
    </Card>
  );
};

export default Taskcard;
