
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useState
} from "react";

import {
  useAuth
} from "../context/AuthContext";

const Register = () => {
  const [form, setForm] =
    useState({
      name: "",
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
    register
  } = useAuth();

  const navigate =
    useNavigate();

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
        await register(form);

        navigate(
          "/dashboard",
          {
            replace: true
          }
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to create account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
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
            BUILD YOUR WORKSPACE
          </span>

          <h1>
            Your next
            <br />
            <em>breakthrough.</em>
          </h1>

          <p>
            Start creating with an
            intelligent workspace built
            around your ideas.
          </p>
        </div>

        <div className="auth-visual-footer">
          <span>
            Secure authentication
          </span>
          <span>•</span>
          <span>
            Free to start
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
            CREATE ACCOUNT
          </span>

          <h2>
            Create your account.
          </h2>

          <p>
            Set up your NexaAI workspace
            in less than a minute.
          </p>

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
              Full name

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>

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
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
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
                ? "Creating..."
                : "Create account"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            {" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

