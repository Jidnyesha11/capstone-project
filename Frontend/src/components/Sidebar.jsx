
import {
  FolderKanban,
  History,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  User
} from "lucide-react";

import {
  NavLink
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Sidebar = ({
  mobileOpen = false,
  onClose
}) => {
  const {
    user,
    isAdmin,
    logout
  } = useAuth();

  const links = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: Home
    },
    {
      label: "AI Workspace",
      path: "/workspace",
      icon: Sparkles
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban
    },
    {
      label: "History",
      path: "/history",
      icon: History
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  if (isAdmin) {
    links.push({
      label: "Admin",
      path: "/admin",
      icon: ShieldCheck
    });
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen
            ? "sidebar-mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-mark">
            <Sparkles size={19} />
          </div>

          <span>Nexa<span>AI</span></span>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {links.map(
            ({
              label,
              path,
              icon: Icon
            }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-upgrade">
            <div className="upgrade-icon">
              <Sparkles size={17} />
            </div>

            <strong>
              Unlock more
            </strong>

            <p>
              Upgrade your workspace
              for more AI generations.
            </p>

            <button
              type="button"
              className="btn btn-dark btn-small"
            >
              View plans
            </button>
          </div>

          <div className="sidebar-user">
            <div className="avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                user?.name
                  ?.charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {user?.name}
              </strong>

              <span>
                {user?.plan || "free"} plan
              </span>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
