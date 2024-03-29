import { AlertColor } from "@mui/material";
import {
  globalStateInterface,
  TaskboardInterface,
  TaskcardInterface,
} from "../interfaces/interfaces";

export type ACTIONS =
  | {
      type: "set taskboards";
      payload: {
        taskboards: {
          userTaskboards: TaskboardInterface[];
          sharedTaskboards?: TaskboardInterface[];
        };
        activeTaskboardId: number;
      };
    }
  | {
      type: "change loading state";
      payload: boolean;
    }
  | {
      type: "set taskcards";
      payload: TaskcardInterface[];
    }
  | {
      type: "change active taskboard";
      payload: number;
    }
  | {
      type: "add new taskboard";
      payload: TaskboardInterface;
    }
  | {
      type: "add new taskcard";
      payload: TaskcardInterface;
    }
  | {
      type: "update taskboard";
      payload: string;
    }
  | {
      type: "update taskcard";
      payload: { newListTitle: string; taskcardId: number };
    }
  | {
      type: "delete taskboard";
      payload: TaskboardInterface;
    }
  | {
      type: "delete taskcard";
      payload: number;
    }
  | {
      type: "change theme";
      payload: "dark" | "light";
    }
  | {
      type: "clear all taskcards";
    }
  | {
      type: "login user";
      payload: {
        user: { email: string; id: number; username: string };
        hasUsedGoogleOauth?: boolean;
      };
    }
  | {
      type: "close snackbar";
    }
  | {
      type: "update snackbar";
      payload: {
        severity: AlertColor;
        message: string;
      };
    }
  | {
      type: "set session token";
      payload: string;
    }
  | {
      type: "logout user";
    }
  | {
      type: "change shared board state";
      payload: boolean;
    }
  | {
      type: "update shared users";
      payload: {
        activeTaskboard?: TaskboardInterface;
        sharedUsers: number[];
      };
    };

export const reducer = (
  state: globalStateInterface,
  action: ACTIONS
): globalStateInterface => {
  switch (action.type) {
    case "set taskboards":
      return {
        ...state,
        taskboards: action.payload.taskboards,
        activeTaskboardId: action.payload.activeTaskboardId,
        isLoading: false,
      };

    case "set taskcards":
      return {
        ...state,
        currentTaskcards: action.payload,
      };

    case "change active taskboard":
      return { ...state, activeTaskboardId: action.payload };

    case "change loading state":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "add new taskboard":
      return {
        ...state,
        taskboards: {
          userTaskboards: [...state.taskboards.userTaskboards, action.payload],
          sharedTaskboards: state.taskboards.sharedTaskboards,
        },
      };

    case "add new taskcard":
      return {
        ...state,
        currentTaskcards: [...state.currentTaskcards, action.payload],
      };

    case "clear all taskcards":
      return {
        ...state,
        currentTaskcards: [],
      };

    case "update taskboard":
      const afterUpdatingBoards = state.taskboards.userTaskboards.map(
        (taskboard) => {
          if (taskboard.id === state.activeTaskboardId) {
            taskboard.boardTitle = action.payload;
          }
          return taskboard;
        }
      );
      return {
        ...state,
        taskboards: {
          ...state.taskboards,
          userTaskboards: afterUpdatingBoards,
        },
      };

    case "update taskcard":
      const afterUpdatingCards = state.currentTaskcards.map((list) => {
        if (list.id === action.payload.taskcardId) {
          list.cardTitle = action.payload.newListTitle;
        }
        return list;
      });
      return {
        ...state,
        currentTaskcards: [...afterUpdatingCards],
      };

    case "delete taskcard":
      const remainingTaskcards = state.currentTaskcards.filter(
        (taskcard) => taskcard.id !== action.payload
      );
      return {
        ...state,
        currentTaskcards: [...remainingTaskcards],
      };

    case "delete taskboard":
      const remainingTaskboards = state.taskboards.userTaskboards.filter(
        (taskboard) => taskboard.id !== action.payload.id
      );
      return {
        ...state,
        taskboards: {
          ...state.taskboards,
          userTaskboards: remainingTaskboards,
        },
        activeTaskboardId:
          remainingTaskboards[remainingTaskboards.length - 1].id,
      };

    case "change theme":
      return {
        ...state,
        themeMode: action.payload,
      };

    case "login user":
      sessionStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        hasUsedGoogleOauth: action.payload.hasUsedGoogleOauth ?? false,
        isLoggedIn: true,
      };

    case "close snackbar":
      return {
        ...state,
        snackbarState: {
          ...state.snackbarState,
          isOpen: false,
        },
      };

    case "update snackbar":
      const { message, severity } = action.payload;
      return {
        ...state,
        snackbarState: {
          ...state.snackbarState,
          isOpen: true,
          message,
          severity,
        },
      };

    case "set session token":
      sessionStorage.setItem("token", action.payload);
      return {
        ...state,
      };

    case "logout user":
      sessionStorage.clear();
      return {
        ...state,
        isLoggedIn: false,
        isLoading: true,
        hasUsedGoogleOauth: false,
        taskboards: {
          userTaskboards: [],
          sharedTaskboards: [],
        },
        themeMode: "light",
        isShared: false,
        currentTaskcards: [],
      };

    case "change shared board state":
      return {
        ...state,
        isShared: action.payload,
      };

    case "update shared users":
      const updatedTasksboards = state.taskboards.userTaskboards.map(
        (taskboard) => {
          if (taskboard.id === action.payload.activeTaskboard?.id) {
            taskboard.sharedUsers = action.payload.sharedUsers;
          }
          return taskboard;
        }
      );
      return {
        ...state,
        taskboards: {
          ...state.taskboards,
          userTaskboards: updatedTasksboards,
        },
      };

    default:
      throw new Error("Reducer error");
  }
};
