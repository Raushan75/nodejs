import axios from "axios";
import { useEffect } from "react";
import { BASE_URL } from "../libs/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../libs/utils/connectionsSlice";

const FALLBACK_PHOTO =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections)
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (connections.length === 0)
    return (
      <h1 className="text-center text-2xl font-bold mt-10">
        No connections found.
      </h1>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 my-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Connections 
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((connection) => {
          const { _id, photoUrl, firstName, lastName, age, gender, about, skills } =
            connection;
          return (
            <div
              key={_id}
              className=" bg-base-300 p-6 flex gap-8 items-center shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="px-4">
                <img
                  className="w-20 h-20 rounded-full object-cover ring ring-primary ring-offset-2 ring-offset-base-300"
                  src={photoUrl || FALLBACK_PHOTO}
                  alt={`${firstName} ${lastName}`}
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_PHOTO)
                      e.currentTarget.src = FALLBACK_PHOTO;
                  }}
                />
              </div>

              <div className="items-center px-7 justify-center text-center">
                <h2 className="text-xl">
                  {firstName} {lastName}
                </h2>

                {(age || gender) && (
                  <p className="text-sm opacity-70 capitalize">
                    {[age, gender].filter(Boolean).join(", ")}
                  </p>
                )}

                <p className="text-sm opacity-80 line-clamp-3">
                  {about || "This is a default description"}
                </p>

                {skills?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <span key={index} className="badge badge-primary badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
