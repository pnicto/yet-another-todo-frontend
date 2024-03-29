import axios from "axios";
import React, { useContext, useReducer } from "react";
import {
  globalContextInterface,
  globalStateInterface,
} from "../interfaces/interfaces";
import { reducer } from "./reducer";
axios.defaults.withCredentials = true;
const AppContext = React.createContext({});

type Props = {
  children: JSX.Element;
};

export const AppProvider = ({ children }: Props) => {
  // Token and user data from session storage to figure out session logins
  let token = sessionStorage.getItem("token");
  const { hasUsedGoogleOauth } = JSON.parse(
    sessionStorage.getItem("user") ?? true.toString()
  );

  // Initial state with light theme and isLoading true
  const [state, dispatch] = useReducer(reducer, {
    isLoggedIn: token !== null ? true : false,
    isLoading: true,
    themeMode: "light",
    snackbarState: {
      isOpen: false,
      message: "Generic message",
      severity: "info",
    },
    hasUsedGoogleOauth: hasUsedGoogleOauth ? true : false,
  } as globalStateInterface);

  // Function which adds either taskcard or taskboard
  const handleAddComponent = async (
    componentName: string,
    setDialogState: React.Dispatch<React.SetStateAction<boolean>>,
    componentBeingAdded: "taskcard" | "taskboard"
  ) => {
    switch (componentBeingAdded) {
      case "taskboard":
        {
          const postBody = {
            taskboardTitle: componentName,
          };
          const url = `${import.meta.env.VITE_APP_API_URL}/taskboards`;
          const postResponse = await axios.post(url, postBody);
          const newTaskboard = postResponse.data;
          dispatch({
            type: "add new taskboard",
            payload: newTaskboard,
          });
          setDialogState(false);
        }
        break;
      case "taskcard":
        {
          const url = `${import.meta.env.VITE_APP_API_URL}/taskCards/${
            state.activeTaskboardId
          }`;
          const postBody = {
            cardTitle: componentName,
          };
          const postResponse = await axios.post(url, postBody);
          const newTaskcard = postResponse.data;
          dispatch({
            type: "add new taskcard",
            payload: newTaskcard,
          });
          setDialogState(false);
        }
        break;
      default:
        throw new Error("Handle Add component");
    }
  };

  return (
    <AppContext.Provider
      value={{
        globalState: state,
        handleAddComponent,
        globalDispatch: dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook which returns the context
export const useGlobalContext = (): globalContextInterface => {
  return useContext(AppContext) as globalContextInterface;
};
