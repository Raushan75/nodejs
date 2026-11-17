import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BASE_URL } from "../libs/utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../libs/utils/userSlice";
import { useEffect, useState } from "react";

// Pages anyone can open without logging in (matched by path prefix)
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password/"];

const Body = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const [checkingAuth, setCheckingAuth] = useState(!user);

  useEffect(() => {
    if (user) return; // already logged in

    const fetchUser = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch {
        // no valid token cookie: the user is not logged in
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route),
  );

  // 1. Still asking the backend who is logged in: show a loader, not the page
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 2. Not logged in and trying to open a protected page: go to login
  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // 3. Already logged in and opening the login page: go to home
  //    (forgot/reset password pages stay open, e.g. a reset link opened while logged in)
  if (user && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // Footer sits at the bottom of the page instead of floating over the content
  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
