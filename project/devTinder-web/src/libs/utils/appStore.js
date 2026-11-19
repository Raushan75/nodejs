import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionsReducer from "./connectionsSlice";
import requestReducer from "./requestSlice";
import toastReducer from "./toastSlice";
import setupAxios from "./setupAxios";
const appStore =configureStore({
  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections: connectionsReducer,
    request: requestReducer,
    toast: toastReducer,
  },
});

// log the user out here when the server says their session ended
setupAxios(appStore);

export default appStore