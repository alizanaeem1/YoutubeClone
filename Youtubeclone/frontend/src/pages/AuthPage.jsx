import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Request failed. Please make sure backend server is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth-brand">
        <span className="auth-brand-mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M10 8.8v6.4l5.4-3.2L10 8.8Z" fill="currentColor" />
          </svg>
        </span>
        <span><span>Stream</span>Tube</span>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={isRegister ? "" : "active"}
          onClick={() => setIsRegister(false)}
        >
          Login
        </button>
        <button
          type="button"
          className={isRegister ? "active" : ""}
          onClick={() => setIsRegister(true)}
        >
          Register
        </button>
      </div>

      <div className="auth-heading">
        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
        <p>{isRegister ? "Start uploading, saving, and building your channel." : "Sign in to continue watching and managing your channel."}</p>
      </div>

      <form onSubmit={submit} className="auth-form">
        {isRegister && (
          <label>
            <span>Name</span>
            <input
              placeholder="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label>
          <span>Email</span>
          <input
            placeholder="you@example.com"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            placeholder="Minimum 6 characters"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p className="text-error">{error}</p>}
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
        </button>
      </form>
      <div className="auth-switch-wrap">
        <button type="button" className="auth-switch" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "Need an account? Register"}
        </button>
      </div>
    </section>
  );
}

export default AuthPage;
