import { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";

// Step 2 of forgot-password: opened from the emailed link, choose a new password.
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The two passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(BASE_URL + "/reset-password/" + token, { password });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-12">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Choose a new password</h2>
            <p className="text-sm text-base-content/60 mt-1">
              8+ characters with uppercase, lowercase, a number and a symbol
            </p>
          </div>

          {done ? (
            <>
              <div role="status" className="alert alert-success alert-soft text-sm">
                <span>Your password has been updated.</span>
              </div>
              <Link to="/login" className="btn btn-primary w-full">
                Go to login
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="New password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Type it again"
                  autoComplete="new-password"
                  required
                />
              </label>

              {error && (
                <div role="alert" className="alert alert-error alert-soft text-sm">
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner loading-sm" />}
                Update password
              </button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link to="/forgot-password" className="link link-primary">
              Request a new link
            </Link>
            {" · "}
            <Link to="/login" className="link link-primary">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
