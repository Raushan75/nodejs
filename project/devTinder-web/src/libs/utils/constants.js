export const BASE_URL = "/api";

export const FALLBACK_PHOTO =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

// Turn an axios error into a message that is safe to show on screen.
// Returns "" for an expired session: the axios interceptor already showed a toast.
export const getErrorMessage = (err) => {
  if (err?.sessionExpired) return "";
  if (!err?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  const data = err.response.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return String(data.message);
  return "Something went wrong";
};

// Swap a broken image for the default avatar (only once, to avoid a loop).
export const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_PHOTO) {
    e.currentTarget.src = FALLBACK_PHOTO;
  }
};
