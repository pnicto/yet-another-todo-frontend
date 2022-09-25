import { Button, TextField } from "@mui/material";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/appContext";
import AlertSnackbar from "../components/misc/AlertSnackbar";
import { useGoogleLogin } from "@react-oauth/google";
import { Google, GitHub } from "@mui/icons-material";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pageMode: "login" | "register" = useLocation().state ?? "login";
  const emailRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();
  const usernameRef = useRef<HTMLInputElement>();
  const { globalDispatch } = useGlobalContext();

  const navigate = useNavigate();

  const handleFormSubmit = async () => {
    setIsLoading(true);
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const username = usernameRef.current?.value;

    if (!email && !password) {
      globalDispatch({
        type: "update snackbar",
        payload: {
          isOpen: true,
          message: "Please provide the required details",
          severity: "error",
        },
      });
    }
    let postBody: {
      email: string | undefined;
      password?: string;
      username?: string;
    } = {
      email,
      password,
    };
    const url = `${process.env.REACT_APP_BASE_URL}/user/${pageMode}`;
    if (pageMode === "register" && username) {
      postBody = { ...postBody, username };
    } else {
      globalDispatch({
        type: "update snackbar",
        payload: {
          isOpen: true,
          message: "Please provide the required details",
          severity: "error",
        },
      });
    }
    const postResponse = await axios.post(url, postBody);

    const { user } = postResponse.data;

    if (pageMode === "login" && postResponse.status === 200 && user) {
      setIsLoading(false);
      navigate("/app");
      globalDispatch({
        type: "login user",
        payload: user as { email: string; id: number; username: string },
      });
      globalDispatch({
        type: "set session token",
        payload: postResponse.data.accessToken,
      });
      globalDispatch({
        type: "update snackbar",
        payload: {
          isOpen: true,
          message: "Login successful",
          severity: "success",
        },
      });
    }

    if (pageMode === "register" && postResponse.status === 201) {
      setIsLoading(false);
      navigate("/form", {
        state: "login",
      });
      globalDispatch({
        type: "update snackbar",
        payload: {
          isOpen: true,
          severity: "success",
          message: "Registration successful. Please login to continue",
        },
      });
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      const url = `${process.env.REACT_APP_BASE_URL}/user/login`;
      const postResponse = await axios.post(url, {
        code: tokenRes.code,
      });
      globalDispatch({
        type: "login user",
        payload: postResponse.data.user,
      });
      globalDispatch({
        type: "update snackbar",
        payload: {
          isOpen: true,
          message: "Login successful",
          severity: "success",
        },
      });
      globalDispatch({
        type: "set session token",
        payload: postResponse.data.accessToken,
      });
      navigate("/app");
    },
    flow: "auth-code",
    onError: (message) => console.log(message),
    scope:
      "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar.events openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  });

  return (
    <>
      <div id="register">
        <form
          id="user-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleFormSubmit();
          }}
        >
          <div id="tasks-heading">
            <h1>TASKS</h1>
            <TaskRoundedIcon className="tasks-icon" />
          </div>
          <TextField
            inputRef={emailRef}
            type="email"
            variant="outlined"
            label="Email"
            fullWidth
            size="small"
            className="login-field"
            autoFocus
          />
          <TextField
            inputRef={passwordRef}
            variant="outlined"
            type="password"
            label="Password"
            fullWidth
            size="small"
            className="login-field"
          />
          {/* Render username field if the page mode is register */}
          {pageMode === "register" && (
            <TextField
              inputRef={usernameRef}
              variant="outlined"
              label="Username"
              fullWidth
              size="small"
              className="login-field"
            />
          )}
          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            {pageMode ?? "Login"}
          </LoadingButton>
          <p>Or</p>
          {pageMode === "login" && (
            <div id="btn-group">
              <Button
                onClick={() => login()}
                variant="contained"
                id="login-btn"
              >
                <Google />
                Sign in with google
              </Button>
              <Button
                href={`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&scope=user`}
                variant="contained"
                id="login-btn"
              >
                <GitHub />
                Sign in with github
              </Button>
            </div>
          )}
        </form>
      </div>
      <AlertSnackbar />
    </>
  );
};

export default Register;
