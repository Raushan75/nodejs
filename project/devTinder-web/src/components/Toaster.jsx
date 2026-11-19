import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../libs/utils/toastSlice";

const DURATION_MS = 3500;

const ICONS = { success: "✓", error: "✕", info: "ℹ", warning: "!" };

// Full class names so Tailwind keeps them in the build
const ALERT_CLASS = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
};

const ToastItem = ({ id, type, message }) => {
  const dispatch = useDispatch();

  // each toast hides itself; the timer is cleared if it's closed early
  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`alert ${ALERT_CLASS[type] || "alert-info"} shadow-lg max-w-sm cursor-pointer`}
      onClick={() => dispatch(removeToast(id))}
      title="Click to dismiss"
    >
      <span className="font-bold">{ICONS[type]}</span>
      <span className="whitespace-normal wrap-break-word">{message}</span>
    </div>
  );
};

// Mounted once in App; shows every toast from the store
const Toaster = () => {
  const toasts = useSelector((store) => store.toast);
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-top toast-end z-50" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default Toaster;
