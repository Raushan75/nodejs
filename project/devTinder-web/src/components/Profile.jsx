import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);

  // On a page refresh the user is fetched after the first render, so wait for it.
  // The key remounts the form once the real user arrives, so it starts with their saved data.
  if (!user) {
    return (
      <div className="flex justify-center my-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return <EditProfile key={user._id} user={user} />;
};

export default Profile;
