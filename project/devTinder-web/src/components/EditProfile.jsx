import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";
import UserCard from "./UserCard";
import { useDispatch } from "react-redux";
import { addUser } from "../libs/utils/userSlice";

const ABOUT_MAX = 250;

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const dispatch = useDispatch();

  // Hide the success toast after 3s, and clear the timer if the page unmounts.
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age: age === "" ? "" : Number(age),
          gender,
          about,
        },
        { withCredentials: true },
      );
      dispatch(addUser(res.data?.data));
      setShowToast(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 my-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-base-content/60 mt-1">
            This is how other developers will see you. The preview updates as
            you type.
          </p>
        </div>

        {/* Two equal columns; items-stretch makes both cards the same height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch max-w-4xl mx-auto">
          <form
            onSubmit={handleSaveProfile}
            className="card bg-base-100 shadow-md w-full"
          >
            <div className="card-body gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">First name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input w-full"
                    placeholder="First name"
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Last name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input w-full"
                    placeholder="Last name"
                    maxLength={50}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Photo URL</span>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input w-full"
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Age</span>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input w-full"
                    placeholder="18+"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Gender</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="select w-full"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">About</span>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="textarea w-full h-28"
                  placeholder="Tell other developers about yourself, your stack, what you're building..."
                  maxLength={ABOUT_MAX}
                />
                <span className="text-xs text-base-content/50 self-end">
                  {about.length}/{ABOUT_MAX}
                </span>
              </label>

              {error && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={saving}
              >
                {saving && <span className="loading loading-spinner loading-sm" />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          {/* Live preview: no Ignore/Interested buttons here */}
          <UserCard
            user={{ firstName, lastName, photoUrl, age, gender, about, skills: user.skills }}
            stretch
            label="Preview"
            showActions={false}
          />
        </div>
      </div>

      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span>Profile updated successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
