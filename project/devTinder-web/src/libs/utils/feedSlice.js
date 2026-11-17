import { createSlice } from "@reduxjs/toolkit";
import { removeUser } from "./userSlice";

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => action.payload,
    removeUserFromFeed: (state, action) =>
      (state || []).filter((user) => user._id !== action.payload),
    clearFeed: () => null,
  },
  // on logout, forget the previous user's feed
  extraReducers: (builder) => builder.addCase(removeUser, () => null),
});

export const { addFeed, removeUserFromFeed, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
