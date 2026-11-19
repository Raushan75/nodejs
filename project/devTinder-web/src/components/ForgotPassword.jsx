import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";
import useToast from "../libs/utils/useToast";

// Step 1 of forgot-password: ask for the email and send a reset link.
const ForgotPassword = () => {
  const [emailId, setEmailId] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(BASE_URL + "/forgot-password", { emailId });
      setMessage(res.data.message);
      toast.success("Reset link sent. Check your email.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-12">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Forgot password?</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Enter your email and we'll send you a link to choose a new password.
            </p>
          </div>

          {message ? (
            <>
              <div role="status" className="alert alert-success alert-soft text-sm">
                <span>{message}</span>
              </div>
              <p className="text-sm text-base-content/60 text-center">
                The link works for 15 minutes. Check your spam folder if you
                don't see it.
              </p>
              <button
                type="button"
                className="btn btn-outline w-full"
                onClick={() => setMessage("")}
              >
                Send again
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="input w-full"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner loading-sm" />}
                Send reset link
              </button>
            </form>
          )}

          <p className="text-center text-sm">
            Remembered it?{" "}
            <Link to="/login" className="link link-primary">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
