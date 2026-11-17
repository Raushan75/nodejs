import { createSlice } from "@reduxjs/toolkit";
import { removeUser } from "./userSlice";

const requestSlice = createSlice({
  name: "request",
  initialState: null,
  reducers: {
    addRequest: (state, action) => action.payload,
    removeRequest: (state, action) =>
      (state || []).filter((request) => request._id !== action.payload),
  },
  // on logout, forget the previous user's requests
  extraReducers: (builder) => builder.addCase(removeUser, () => null),
});

export const { addRequest, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
