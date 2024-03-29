import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/appContext";

const GithubOauthWaitPage = () => {
  const navigate = useNavigate();
  const { globalDispatch, globalState } = useGlobalContext();

  useEffect(() => {
    // Get the code github gives you on the callback url
    const code = document.URL.split("code=")?.[1];

    // Function to make request to server with the code
    const githubOauth = async () => {
      const postResponse = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/github/auth`,
        {
          code,
        }
      );
      if (postResponse.status === 200) {
        globalDispatch({
          type: "login user",
          payload: {
            user: postResponse.data,
          },
        });
        globalDispatch({
          type: "update snackbar",
          payload: {
            message: "Login successful",
            severity: "success",
          },
        });
        console.log(postResponse);
        globalDispatch({
          type: "set session token",
          payload: postResponse.data.accessToken,
        });
        navigate("/app");
      }
    };

    if (code) {
      githubOauth();
    }

    if (globalState.isLoggedIn) {
      navigate("/app");
      return;
    }
  }, [globalDispatch, globalState.isLoggedIn, navigate]);

  // In the meanwhile show the loading indicator
  return (
    <div id="loading-indicator">
      <CircularProgress color="info" />
    </div>
  );
};

export default GithubOauthWaitPage;
