import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  BASE_URL,
  FALLBACK_PHOTO,
  getErrorMessage,
  handleImageError,
} from "../libs/utils/constants";
import { removeUserFromFeed } from "../libs/utils/feedSlice";
import useToast from "../libs/utils/useToast";

// How far (px) the card must be dragged before letting go counts as a swipe.
const SWIPE_THRESHOLD = 100;
// How long the fly-off animation takes (ms).
const FLY_OUT_MS = 300;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// stretch: fill the parent (width and height) and let the photo take the spare height,
//          so the card can line up with something next to it.
// showActions: show Ignore / Interested and enable swiping.
//              Turn off for previews (there's no real user to send to).
const UserCard = ({ user, stretch = false, label, showActions = true }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about, skills } = user;
  const dispatch = useDispatch();
  const [sending, setSending] = useState(false);
  const toast = useToast();

  // swipe state: how far the card is dragged sideways, and whether a finger/mouse is down
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  // swipe right = interested, swipe left = ignored
  const sendRequest = async (status) => {
    if (sending) return;
    const direction = status === "interested" ? 1 : -1;
    setSending(true);
    // fly the card off the screen while the request is sent
    setDragX(direction * (window.innerWidth + 200));
    try {
      await Promise.all([
        axios.post(
          BASE_URL + "/request/send/" + status + "/" + _id,
          {},
          { withCredentials: true },
        ),
        wait(FLY_OUT_MS),
      ]);
      // the next user in the feed replaces this card
      dispatch(removeUserFromFeed(_id));
      if (status === "interested") {
        toast.success(`Request sent to ${firstName || "this developer"}`);
      } else {
        toast.info(`You ignored ${firstName || "this developer"}`);
      }
    } catch (err) {
      // bring the card back and show what went wrong
      setDragX(0);
      toast.error(getErrorMessage(err));
      setSending(false);
    }
  };

  // ---- mouse / touch dragging (pointer events cover both) ----
  const handlePointerDown = (e) => {
    if (!showActions || sending) return;
    if (e.target.closest("button")) return; // let the buttons be clicked normally
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) sendRequest("interested");
    else if (dragX < -SWIPE_THRESHOLD) sendRequest("ignored");
    else setDragX(0); // not far enough: snap back to the middle
  };

  // ---- keyboard: → interested, ← ignore ----
  useEffect(() => {
    if (!showActions) return;
    const onKeyDown = (e) => {
      // don't steal arrow keys while the user is typing somewhere
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") sendRequest("interested");
      if (e.key === "ArrowLeft") sendRequest("ignored");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // 0 → 1 as the card is dragged towards the swipe threshold
  const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  return (
    <div
      className={`card bg-base-100 shadow-xl overflow-hidden ${
        stretch ? "w-full h-full" : "w-full max-w-sm"
      } ${showActions ? "select-none touch-pan-y cursor-grab active:cursor-grabbing" : ""}`}
      style={
        showActions
          ? {
              transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
              // follow the pointer exactly while dragging, animate otherwise
              transition: dragging ? "none" : `transform ${FLY_OUT_MS}ms ease-out`,
            }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <figure
        className={`relative bg-base-300 ${
          stretch ? "flex-1 min-h-64" : "aspect-square"
        }`}
      >
        {label && (
          <span className="badge badge-neutral absolute top-3 left-3 z-10">
            {label}
          </span>
        )}

        {/* stamps that fade in while swiping */}
        {showActions && dragX > 0 && (
          <span
            className="absolute top-6 left-6 z-10 -rotate-12 border-4 border-success text-success font-extrabold text-2xl px-3 py-1 rounded-lg bg-base-100/70"
            style={{ opacity: swipeProgress }}
          >
            INTERESTED
          </span>
        )}
        {showActions && dragX < 0 && (
          <span
            className="absolute top-6 right-6 z-10 rotate-12 border-4 border-error text-error font-extrabold text-2xl px-3 py-1 rounded-lg bg-base-100/70"
            style={{ opacity: swipeProgress }}
          >
            IGNORE
          </span>
        )}

        <img
          src={photoUrl || FALLBACK_PHOTO}
          alt={`${firstName || ""} ${lastName || ""}`.trim() || "Profile photo"}
          className={`w-full h-full object-cover pointer-events-none ${stretch ? "absolute inset-0" : ""}`}
          draggable={false}
          onError={handleImageError}
        />
      </figure>
      <div className="card-body gap-3">
        <h2 className="card-title text-2xl flex-wrap">
          {firstName || "Your name"} {lastName}
          {age && (
            <span className="font-normal text-base-content/60">{age}</span>
          )}
        </h2>
        {gender && (
          <div className="badge badge-outline capitalize">{gender}</div>
        )}
        <p className="text-base-content/80 wrap-break-word">
          {about || "No description available."}
        </p>
        {skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="badge badge-soft badge-primary">
                {skill}
              </span>
            ))}
          </div>
        )}

        {showActions && (
          <div className="card-actions grid grid-cols-2 gap-3 mt-2">
            <button
              className="btn btn-outline"
              disabled={sending}
              onClick={() => sendRequest("ignored")}
            >
              ✕ Ignore
            </button>
            <button
              className="btn btn-primary"
              disabled={sending}
              onClick={() => sendRequest("interested")}
            >
              ♥ Interested
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
