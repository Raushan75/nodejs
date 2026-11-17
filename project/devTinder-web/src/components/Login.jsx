import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../libs/utils/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";

const Login = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // a real <form> so pressing Enter submits
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLoginForm) {
        const res = await axios.post(
          BASE_URL + "/login",
          { emailId, password },
          { withCredentials: true },
        );
        dispatch(addUser(res.data));
        navigate("/");
      } else {
        const res = await axios.post(
          BASE_URL + "/signup",
          { emailId, password, firstName, lastName },
          { withCredentials: true },
        );
        dispatch(addUser(res.data.data));
        navigate("/profile");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setError("");
  };

  return (
    <div className="flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="card bg-base-100 shadow-xl w-full max-w-sm"
      >
        <div className="card-body gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isLoginForm ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-base-content/60 mt-1">
              {isLoginForm
                ? "Log in to find developers to build with"
                : "Join DevTinder and meet other developers"}
            </p>
          </div>

          {!isLoginForm && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input w-full"
                  placeholder="First name"
                  minLength={2}
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input w-full"
                  placeholder="Last name"
                />
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="flex justify-between items-center">
              <span className="text-sm font-medium">Password</span>
              {isLoginForm && (
                <Link to="/forgot-password" className="link link-primary text-xs">
                  Forgot password?
                </Link>
              )}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="Password"
              autoComplete={isLoginForm ? "current-password" : "new-password"}
              required
            />
            {!isLoginForm && (
              <span className="text-xs text-base-content/50">
                8+ characters with uppercase, lowercase, a number and a symbol
              </span>
            )}
          </label>

          {error && (
            <div role="alert" className="alert alert-error alert-soft text-sm">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            {isLoginForm ? "Login" : "Sign up"}
          </button>

          <p className="text-center text-sm">
            {isLoginForm ? "New to DevTinder? " : "Already have an account? "}
            <button type="button" className="link link-primary" onClick={toggleForm}>
              {isLoginForm ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
