import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";
import { addFeed, clearFeed } from "../libs/utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const getFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      setError("");
      dispatch(addFeed(res.data));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // clear the feed (shows the loader) and load it again
  const refreshFeed = () => {
    setError("");
    dispatch(clearFeed());
    getFeed();
  };

  useEffect(() => {
    // state is only set after the request finishes (after await), not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!feed) getFeed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 px-4 text-center">
        <p className="text-error">{error}</p>
        <button className="btn btn-outline" onClick={refreshFeed}>
          Try again
        </button>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="flex justify-center my-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 my-16 px-4 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold">You're all caught up</h2>
        <p className="text-base-content/60">
          No more developers to show right now. Check back later.
        </p>
        <button className="btn btn-primary mt-2" onClick={refreshFeed}>
          Refresh feed
        </button>
      </div>
    );
  }

  return (
    // overflow-x-hidden: the card flying off the screen must not cause a sideways scrollbar
    <div className="flex flex-col items-center gap-3 py-10 px-4 overflow-x-hidden">
      {/* key: each user gets a fresh card, so the swipe position resets for the next one */}
      <UserCard key={feed[0]._id} user={feed[0]} />
      <p className="text-sm text-base-content/50 text-center">
        Swipe right for <span className="text-success font-medium">Interested</span>,
        left to <span className="text-error font-medium">Ignore</span> (or use the ← → keys)
      </p>
      <p className="text-xs text-base-content/40">
        {feed.length} {feed.length === 1 ? "developer" : "developers"} in your feed
      </p>
    </div>
  );
};

export default Feed;
