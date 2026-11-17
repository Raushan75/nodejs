export const BASE_URL = "http://localhost:3000";

export const FALLBACK_PHOTO =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

// Turn an axios error into a message that is safe to show on screen.
export const getErrorMessage = (err) => {
  if (!err?.response) {
    return "Cannot reach the server. Is the backend running on port 3000?";
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
