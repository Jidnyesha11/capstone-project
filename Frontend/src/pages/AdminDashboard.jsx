
import {
  Activity,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import {
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from "../services/adminService";

import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";

const AdminDashboard = () => {
  const [stats, setStats] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const loadAdmin =
    async () => {
      try {
        const [
          dashboardResult,
          usersResult
        ] = await Promise.all([
          getAdminDashboard(),
          getAdminUsers({
            limit: 50
          })
        ]);

        setStats(
          dashboardResult.data
        );

        setUsers(
          usersResult.data || []
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const runLoad = () => {
      void loadAdmin();
    };

    queueMicrotask(runLoad);
  }, []);

  const changeRole =
    async (
      user,
      role
    ) => {
      try {
        await updateUserRole(
          user._id,
          role
        );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                user._id
                  ? {
                      ...item,
                      role
                    }
                  : item
            )
        );

        setToast(
          "User role updated."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to update role."
        );
      }
    };

  const changeStatus =
    async (
      user
    ) => {
      try {
        await updateUserStatus(
          user._id,
          !user.isActive
        );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                user._id
                  ? {
                      ...item,
                      isActive:
                        !item.isActive
                    }
                  : item
            )
        );

        setToast(
          "User status updated."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to update status."
        );
      }
    };

  const removeUser =
    async (user) => {
      if (
        !window.confirm(
          `Delete ${user.name}?`
        )
      ) {
        return;
      }

      try {
        await deleteUser(
          user._id
        );

        setUsers(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                user._id
            )
        );

        setToast(
          "User deleted."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to delete user."
        );
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
            ADMIN
          </span>

          <h1>
            Platform overview
          </h1>

          <p>
            Monitor NexaAI users and
            platform activity.
          </p>
        </div>

        <div className="admin-status">
          <ShieldCheck size={16} />
          Administrator
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total users"
          value={
            stats?.totalUsers || 0
          }
          icon={Users}
        />

        <StatCard
          title="Active users"
          value={
            stats?.activeUsers || 0
          }
          icon={UserCheck}
        />

        <StatCard
          title="Total projects"
          value={
            stats?.totalProjects || 0
          }
          icon={Activity}
        />

        <StatCard
          title="Generations"
          value={
            stats?.totalGenerations ||
            0
          }
          icon={ShieldCheck}
        />
      </div>

      <section className="dashboard-card admin-users-card">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">
              USERS
            </span>

            <h2>
              User management
            </h2>
          </div>

          <span className="admin-count">
            {users.length} users
          </span>
        </div>

        {users.length ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    User
                  </th>
                  <th>
                    Role
                  </th>
                  <th>
                    Plan
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Joined
                  </th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (user) => (
                    <tr
                      key={
                        user._id
                      }
                    >
                      <td>
                        <div className="admin-user-cell">
                          <div className="avatar">
                            {user.avatar ? (
                              <img
                                src={
                                  user.avatar
                                }
                                alt={
                                  user.name
                                }
                              />
                            ) : (
                              user.name
                                ?.charAt(
                                  0
                                )
                                .toUpperCase()
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                user.name
                              }
                            </strong>

                            <span>
                              {
                                user.email
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          className="table-select"
                          value={
                            user.role
                          }
                          onChange={(
                            event
                          ) =>
                            changeRole(
                              user,
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="user">
                            User
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      </td>

                      <td>
                        <span className="plan-badge">
                          {
                            user.plan
                          }
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`status-pill ${
                            user.isActive
                              ? "active"
                              : "inactive"
                          }`}
                          onClick={() =>
                            changeStatus(
                              user
                            )
                          }
                        >
                          <span />
                          {user.isActive
                            ? "Active"
                            : "Disabled"}
                        </button>
                      </td>

                      <td>
                        {formatDate(
                          user.createdAt
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="icon-button danger"
                          onClick={() =>
                            removeUser(
                              user
                            )
                          }
                          title="Delete user"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users"
            description="There are no users on the platform yet."
          />
        )}
      </section>
    </div>
  );
};

const formatDate = (
  date
) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(new Date(date));
};

export default AdminDashboard;
