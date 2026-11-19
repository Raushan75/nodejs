import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_URL,
  FALLBACK_PHOTO,
  getErrorMessage,
  handleImageError,
} from "../libs/utils/constants";
import { addRequest, removeRequest } from "../libs/utils/requestSlice";
import { removeConnections } from "../libs/utils/connectionsSlice";
import useToast from "../libs/utils/useToast";

function Requests() {
  const requests = useSelector((store) => store.request);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      setError("");
      dispatch(addRequest(res.data.data));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  const reviewRequest = async (status, requestId, name) => {
    setBusyId(requestId);
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + requestId,
        {},
        { withCredentials: true },
      );
      dispatch(removeRequest(requestId));
      // a new connection exists now, so reload the list next time it's opened
      if (status === "accepted") {
        dispatch(removeConnections());
        toast.success(`You're now connected with ${name}`);
      } else {
        toast.info(`Request from ${name} rejected`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    // state is only set after the request finishes (after await), not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!requests && error) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 px-4 text-center">
        <p className="text-error">{error}</p>
        <button className="btn btn-outline" onClick={fetchRequests}>
          Try again
        </button>
      </div>
    );
  }

  if (!requests) {
    return (
      <div className="flex justify-center my-16">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 my-16 px-4 text-center">
        <span className="text-5xl">📭</span>
        <h2 className="text-2xl font-bold">No pending requests</h2>
        <p className="text-base-content/60">
          When someone is interested in you, their request will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 my-10">
      <h1 className="text-3xl font-bold text-center mb-2">Requests</h1>
      <p className="text-center text-base-content/60 mb-8">
        {requests.length} {requests.length === 1 ? "developer wants" : "developers want"}{" "}
        to connect with you
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((request) => {
          // the sender's profile is in fromUserId
          const { _id } = request;
          const { photoUrl, firstName, lastName, age, gender, about } =
            request.fromUserId || {};
          const busy = busyId === _id;
          return (
            <div
              key={_id}
              className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow p-5 gap-4"
            >
              <div className="flex gap-5 items-center">
                <img
                  className="w-20 h-20 shrink-0 rounded-full object-cover ring ring-primary ring-offset-2 ring-offset-base-100"
                  src={photoUrl || FALLBACK_PHOTO}
                  alt={`${firstName} ${lastName || ""}`}
                  onError={handleImageError}
                />
                <div className="min-w-0">
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="btn btn-outline"
                  disabled={busy}
                  onClick={() => reviewRequest("rejected", _id, firstName)}
                >
                  Reject
                </button>
                <button
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => reviewRequest("accepted", _id, firstName)}
                >
                  {busy && <span className="loading loading-spinner loading-sm" />}
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Requests;
