import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "./toastSlice";

// const toast = useToast();
// toast.success("Saved"); toast.error("Something broke"); toast.info("Heads up");
const useToast = () => {
  const dispatch = useDispatch();
  return useMemo(() => {
    // an empty message shows nothing (e.g. an expired session, already announced)
    const show = (type) => (message) => {
      if (message) dispatch(addToast(type, message));
    };
    return {
      success: show("success"),
      error: show("error"),
      info: show("info"),
      warning: show("warning"),
    };
  }, [dispatch]);
};

export default useToast;
