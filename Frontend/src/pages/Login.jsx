
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useState
} from "react";

import {
  useAuth
} from "../context/AuthContext";

const Login = () => {
  const [form, setForm] =
    useState({
      email: "",
      password: ""
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const {
    login
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const from =
    location.state?.from ||
    "/dashboard";

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value
    });
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        const result =
          await login(form);

        if (
          result.user.role ===
          "admin"
        ) {
          navigate(
            "/admin",
            {
              replace: true
            }
          );
        } else {
          navigate(
            from,
            {
              replace: true
            }
          );
        }
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to sign in."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your intelligent workspace."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password

          <div className="password-field">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Sign in"}

          {!loading && (
            <ArrowRight size={17} />
          )}
        </button>
      </form>

      <div className="auth-demo">
        <strong>
          Demo credentials
        </strong>

        <span>
          user@nexaai.com / User@123
        </span>
      </div>

      <p className="auth-switch">
        Don't have an account?
        {" "}
        <Link to="/register">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

const AuthLayout = ({
  children,
  title,
  subtitle
}) => (
  <div className="auth-page">
    <div className="auth-visual">
      <Link
        to="/"
        className="auth-logo"
      >
        <div className="logo-mark">
          <Sparkles size={19} />
        </div>
        Nexa<span>AI</span>
      </Link>

      <div className="auth-visual-content">
        <span>
          YOUR AI WORKSPACE
        </span>

        <h1>
          Make every idea
          <br />
          <em>count.</em>
        </h1>

        <p>
          A focused workspace for
          creating better content,
          faster.
        </p>
      </div>

      <div className="auth-visual-footer">
        <span>
          MERN Capstone Project
        </span>
        <span>
          •
        </span>
        <span>
          Built for creators
        </span>
      </div>
    </div>

    <div className="auth-panel">
      <Link
        to="/"
        className="auth-back"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="auth-form-container">
        <span className="auth-eyebrow">
          GET STARTED
        </span>

        <h2>{title}</h2>
        <p>{subtitle}</p>

        {children}
      </div>
    </div>
  </div>
);

export default Login;
