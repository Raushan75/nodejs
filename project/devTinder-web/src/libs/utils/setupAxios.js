import axios from "axios";
import { removeUser } from "./userSlice";
import { addToast } from "./toastSlice";

// When the server says the session is no longer valid (401) while we think
// the user is logged in (cookie expired, or password changed on another
// device), log out here too. Body then sends the user to /login.
const setupAxios = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url || "";
      const loggedIn = Boolean(store.getState().user);
      // a 401 from /login just means a wrong password, not an expired session
      if (error.response?.status === 401 && loggedIn && !url.endsWith("/login")) {
        // tells getErrorMessage() not to show a second toast for this error
        error.sessionExpired = true;
        store.dispatch(removeUser());
        const reason =
          typeof error.response.data === "string" && error.response.data.trim()
            ? error.response.data
            : "Your session has expired, please login again";
        store.dispatch(addToast("warning", reason));
      }
      return Promise.reject(error);
    },
  );
};

export default setupAxios;
