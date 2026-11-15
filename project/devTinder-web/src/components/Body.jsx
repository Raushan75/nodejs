import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BASE_URL } from "../libs/utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../libs/utils/userSlice";
import { useEffect, useState } from "react";

// Pages anyone can open without logging in
const PUBLIC_ROUTES = ["/login"];

const Body = () => {
  // Hooks must be called at the top level of the component, never inside another function
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
      } catch (err) {
        // 401 / 400 = no valid token cookie, so the user is not logged in
        console.error("Not logged in:", err?.response?.data || err.message);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  // 1. Still asking the backend who is logged in: show a loader, not the page
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 2. Not logged in and trying to open a protected page: go to login
  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // 3. Already logged in and opening the login page: go to home
  if (user && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Body;
