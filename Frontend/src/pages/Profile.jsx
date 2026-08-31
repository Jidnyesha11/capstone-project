
import {
  Camera,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import {
  getProfile,
  updateProfile
} from "../services/profileService";

import Loader from "../components/Loader";
import Toast from "../components/Toast";

const Profile = () => {
  const [profile, setProfile] =
    useState(null);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      bio: "",
      avatar: ""
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    const load =
      async () => {
        try {
          const result =
            await getProfile();

          setProfile(
            result.data
          );

          setForm({
            name:
              result.data.name ||
              "",
            email:
              result.data.email ||
              "",
            bio:
              result.data.bio ||
              "",
            avatar:
              result.data.avatar ||
              ""
          });
        } catch (requestError) {
          setError(
            requestError.response
              ?.data?.message ||
              "Unable to load profile."
          );
        } finally {
          setLoading(false);
        }
      };

    load();
  }, []);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setError("");

      try {
        const result =
          await updateProfile(
            form
          );

        setProfile({
          ...profile,
          ...result.data
        });

        setToast(
          "Profile updated successfully."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return <Loader />;
  }

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
            Profile
          </h1>

          <p>
            Manage your personal
            information.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-cover">
            <div className="profile-avatar-large">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                />
              ) : (
                profile?.name
                  ?.charAt(0)
                  .toUpperCase()
              )}
            </div>

            <button
              type="button"
              className="profile-camera"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className="profile-summary">
            <h2>
              {profile?.name}
            </h2>

            <p>
              {profile?.email}
            </p>

            <span className="plan-badge">
              <Sparkles size={13} />
              {profile?.plan} plan
            </span>
          </div>

          <div className="profile-stats">
            <div>
              <strong>
                {profile?.usage
                  ?.generations || 0}
              </strong>
              <span>
                Generations
              </span>
            </div>

            <div>
              <strong>
                {profile?.usage
                  ?.projectsCreated ||
                  0}
              </strong>
              <span>
                Projects
              </span>
            </div>

            <div>
              <strong>
                {formatNumber(
                  profile?.usage
                    ?.tokensUsed || 0
                )}
              </strong>
              <span>
                Tokens
              </span>
            </div>
          </div>
        </section>

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                Personal information
              </h2>

              <p>
                Update your profile
                details.
              </p>
            </div>

            <UserRound size={20} />
          </div>

          <form
            className="settings-form"
            onSubmit={handleSubmit}
          >
            <div className="field-row">
              <label>
                Full name

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name:
                        event.target
                          .value
                    })
                  }
                  required
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email:
                        event.target
                          .value
                    })
                  }
                  required
                />
              </label>
            </div>

            <label>
              Avatar URL

              <input
                value={form.avatar}
                onChange={(event) =>
                  setForm({
                    ...form,
                    avatar:
                      event.target
                        .value
                  })
                }
                placeholder="https://..."
              />
            </label>

            <label>
              Bio

              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({
                    ...form,
                    bio:
                      event.target
                        .value
                  })
                }
                rows={5}
                maxLength={300}
                placeholder="Tell us a little about yourself..."
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </form>

          <div className="security-note">
            <ShieldCheck size={18} />

            <div>
              <strong>
                Your account is protected
              </strong>

              <p>
                Authentication is secured
                with JWT and encrypted
                passwords.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const formatNumber = (
  value
) =>
  new Intl.NumberFormat(
    "en-US",
    {
      notation:
        value > 9999
          ? "compact"
          : "standard"
    }
  ).format(value);

export default Profile;

