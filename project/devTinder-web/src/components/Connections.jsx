import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_URL,
  FALLBACK_PHOTO,
  getErrorMessage,
  handleImageError,
} from "../libs/utils/constants";
import { addConnections } from "../libs/utils/connectionsSlice";
import useToast from "../libs/utils/useToast";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      setError("");
      dispatch(addConnections(res.data.data));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    // state is only set after the request finishes (after await), not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConnections();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 px-4 text-center">
        <p className="text-error">{error}</p>
        <button className="btn btn-outline" onClick={fetchConnections}>
          Try again
        </button>
      </div>
    );
  }

  if (!connections) {
    return (
      <div className="flex justify-center my-16">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 my-16 px-4 text-center">
        <span className="text-5xl">🤝</span>
        <h2 className="text-2xl font-bold">No connections yet</h2>
        <p className="text-base-content/60">
          Show interest in developers from your feed to start connecting.
        </p>
        <Link to="/" className="btn btn-primary mt-2">
          Go to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 my-10">
      <h1 className="text-3xl font-bold text-center mb-2">Connections</h1>
      <p className="text-center text-base-content/60 mb-8">
        {connections.length}{" "}
        {connections.length === 1 ? "developer" : "developers"} you're connected
        with
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map(
          ({ _id, photoUrl, firstName, lastName, age, gender, about }) => (
            <div
              key={_id}
              className="card card-side bg-base-100 shadow-md hover:shadow-xl transition-shadow p-5 gap-5 items-center"
            >
              <img
                className="w-20 h-20 shrink-0 rounded-full object-cover ring ring-primary ring-offset-2 ring-offset-base-100"
                src={photoUrl || FALLBACK_PHOTO}
                alt={`${firstName} ${lastName || ""}`}
                onError={handleImageError}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold">
                  {firstName} {lastName}
                </h2>
                {(age || gender) && (
                  <p className="text-sm text-base-content/60 capitalize">
                    {[age, gender].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="text-sm text-base-content/80 line-clamp-3 mt-1">
                  {about || "No description available."}
                </p>
              </div>
              <Link to={"/chat/" + _id} className="btn btn-primary btn-sm shrink-0">
                💬 Chat
              </Link>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default Connections;
