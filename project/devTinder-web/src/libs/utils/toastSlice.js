import { createSlice, nanoid } from "@reduxjs/toolkit";

// Toasts shown in the corner of every page. Each toast is { id, type, message }.
// type is a daisyUI alert colour: "success" | "error" | "info" | "warning".
const toastSlice = createSlice({
  name: "toast",
  initialState: [],
  reducers: {
    addToast: {
      reducer: (state, action) => {
        state.push(action.payload);
        // keep at most 4 on screen, drop the oldest
        if (state.length > 4) state.shift();
      },
      prepare: (type, message) => ({
        payload: { id: nanoid(), type, message },
      }),
    },
    removeToast: (state, action) =>
      state.filter((toast) => toast.id !== action.payload),
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
