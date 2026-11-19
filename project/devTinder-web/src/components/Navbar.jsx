import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { removeUser } from "../libs/utils/userSlice";
import useToast from "../libs/utils/useToast";
import {
  BASE_URL,
  FALLBACK_PHOTO,
  handleImageError,
} from "../libs/utils/constants";

const NAV_LINKS = [
  { to: "/", label: "Feed" },
  { to: "/connections", label: "Connections" },
  { to: "/requests", label: "Requests" },
];

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      toast.info("You've been logged out");
    } catch (err) {
      console.error("Error logging out:", err);
      toast.warning("Logged out on this device, but the server couldn't be reached");
    } finally {
      // clear the user (and, through the slices, their feed/requests/connections)
      dispatch(removeUser());
      navigate("/login");
    }
  };

  return (
    <div className="navbar bg-base-300 shadow-sm px-4 sticky top-0 z-40">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl gap-1">
          👨‍💻 DevTinder
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <ul className="menu menu-horizontal hidden md:flex gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) => (isActive ? "menu-active" : "")}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="hidden sm:block text-sm">Hi, {user.firstName}</p>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-300 ring-offset-2">
                <img
                  alt={user.firstName}
                  src={user.photoUrl || FALLBACK_PHOTO}
                  onError={handleImageError}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile">Edit profile</Link>
              </li>
              {/* on small screens the top links are hidden, so show them here */}
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to} className="md:hidden">
                  <Link to={to}>{label}</Link>
                </li>
              ))}
              <li>
                <button onClick={handleLogout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
