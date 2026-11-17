import { createSlice } from "@reduxjs/toolkit";
import { removeUser } from "./userSlice";

const connectionsSlice = createSlice({
  name: "connections",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnections: () => null,
  },
  // on logout, forget the previous user's connections
  extraReducers: (builder) => builder.addCase(removeUser, () => null),
});

export const { addConnections, removeConnections } = connectionsSlice.actions;
export default connectionsSlice.reducer;
