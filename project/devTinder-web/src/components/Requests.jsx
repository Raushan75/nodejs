import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../libs/utils/constants";
import { addRequest } from "../libs/utils/requestSlice";

const FALLBACK_PHOTO =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function Requests() {
  const requests = useSelector((store) => store.request);
  const dispatch = useDispatch();
  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      console.log("Requests data:", res.data.data);
      dispatch(addRequest(res.data.data));
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests)
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (requests.length === 0)
    return (
      <h1 className="text-center text-2xl font-bold mt-10">
        No requests found.
      </h1>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 my-10">
      <h1 className="text-3xl font-bold text-center mb-8">Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((request) => {
          // each item is a connection request; the sender's profile is in fromUserId
          const { _id } = request;
          const { photoUrl, firstName, lastName, age, gender, about } =
            request.fromUserId || {};
          return (
            <div
              key={_id}
              className=" bg-base-300 p-6 flex gap-8 items-center justify-between shadow-md hover:shadow-xl transition-shadow"
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
                <div className="flex gap-4 justify-center mt-4">
                  <button className="btn btn-primary">Reject</button>
                  <button className="btn btn-secondary">Accept</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Requests;
