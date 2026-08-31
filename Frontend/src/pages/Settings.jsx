
import {
  Bell,
  LockKeyhole,
  Moon,
  Shield,
  Sun
} from "lucide-react";

import {
  useState
} from "react";

import {
  changePassword
} from "../services/profileService";

import Toast from "../components/Toast";

const Settings = () => {
  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: ""
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  const handlePasswordChange =
    (event) => {
      setPasswordForm({
        ...passwordForm,
        [event.target.name]:
          event.target.value
      });
    };

  const submitPassword =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setError("");

      try {
        await changePassword(
          passwordForm
        );

        setPasswordForm({
          currentPassword: "",
          newPassword: ""
        });

        setToast(
          "Password changed successfully."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to change password."
        );
      } finally {
        setSaving(false);
      }
    };

  const toggleTheme = () => {
    setDarkMode(
      !darkMode
    );

    document.documentElement.classList.toggle(
      "dark-theme"
    );
  };

  return (
    <div className="standard-page">
      <Toast
        message={toast}
        onClose={() =>
          setToast("")
        }
      />

      <div className="page-header">
        <div>
          <span className="eyebrow">
            ACCOUNT
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Control your preferences and
            account security.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="settings-grid">
        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                Appearance
              </h2>

              <p>
                Customize how NexaAI
                looks.
              </p>
            </div>

            {darkMode ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              {darkMode ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </div>

            <div className="setting-info">
              <strong>
                Dark mode
              </strong>

              <span>
                Use a darker color scheme.
              </span>
            </div>

            <button
              type="button"
              className={`toggle ${
                darkMode
                  ? "on"
                  : ""
              }`}
              onClick={
                toggleTheme
              }
            >
              <span />
            </button>
          </div>
        </section>

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose what you hear from
                NexaAI.
              </p>
            </div>

            <Bell size={20} />
          </div>

          <SettingToggle
            title="Generation completed"
            description="Notify me when content generation finishes."
            defaultOn
          />

          <SettingToggle
            title="Product updates"
            description="Receive updates about new features."
          />

          <SettingToggle
            title="Weekly activity"
            description="Get a weekly summary of your workspace."
            defaultOn
          />
        </section>

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                Change password
              </h2>

              <p>
                Keep your account secure.
              </p>
            </div>

            <LockKeyhole size={20} />
          </div>

          <form
            className="settings-form"
            onSubmit={
              submitPassword
            }
          >
            <label>
              Current password

              <input
                type="password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
              />
            </label>

            <label>
              New password

              <input
                type="password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update password"}
            </button>
          </form>
        </section>

        <section className="form-card security-card">
          <div className="security-big-icon">
            <Shield size={25} />
          </div>

          <h2>
            Account security
          </h2>

          <p>
            Your NexaAI account uses JWT
            authentication and protected
            backend routes.
          </p>

          <span className="secure-status">
            <span />
            Security active
          </span>
        </section>
      </div>
    </div>
  );
};

const SettingToggle = ({
  title,
  description,
  defaultOn = false
}) => {
  const [on, setOn] =
    useState(defaultOn);

  return (
    <div className="setting-row">
      <div className="setting-info">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`toggle ${
          on ? "on" : ""
        }`}
        onClick={() =>
          setOn(!on)
        }
      >
        <span />
      </button>
    </div>
  );
};

export default Settings;
