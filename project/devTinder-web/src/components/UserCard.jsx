const FALLBACK_PHOTO =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

// stretch: fill the parent (width and height) and let the photo take the spare height,
// so the card can line up with something next to it. Otherwise it's a fixed-size card.
const UserCard = ({ user, stretch = false, label }) => {
  const { firstName, lastName, photoUrl, age, gender, about } = user;

  return (
    <div
      className={`card bg-base-100 shadow-xl overflow-hidden ${
        stretch ? "w-full h-full" : "w-80 sm:w-96"
      }`}
    >
      <figure
        className={`relative bg-base-300 ${
          stretch ? "flex-1 min-h-64" : "aspect-4/5"
        }`}
      >
        {label && (
          <span className="badge badge-neutral absolute top-3 left-3 z-10">
            {label}
          </span>
        )}
        <img
          src={photoUrl || FALLBACK_PHOTO}
          alt={`${firstName} ${lastName}`}
          className={`w-full h-full object-cover ${stretch ? "absolute inset-0" : ""}`}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_PHOTO) {
              e.currentTarget.src = FALLBACK_PHOTO;
            }
          }}
        />
      </figure>
      <div className="card-body gap-3">
        <h2 className="card-title text-2xl">
          {firstName || "Your name"} {lastName}
          {age && <span className="font-normal text-base-content/60">{age}</span>}
        </h2>
        {gender && (
          <div className="badge badge-outline capitalize">{gender}</div>
        )}
        <p className="text-base-content/80 wrap-break-word">
          {about || "No description available."}
        </p>
        <div className="card-actions grid grid-cols-2 gap-3 mt-2">
          <button className="btn btn-outline">Ignore</button>
          <button className="btn btn-primary">Interested</button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
