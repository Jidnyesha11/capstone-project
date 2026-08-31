
import {
  Menu,
  Search,
  Bell,
  Plus,
  X,
  Sparkles
} from "lucide-react";

import {
  useState
} from "react";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

import {
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const AppShell = ({
  children
}) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <main className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
              type="button"
            >
              {mobileOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            <div className="mobile-logo">
              <div className="logo-mark">
                <SparklesIcon />
              </div>
              Nexa<span>AI</span>
            </div>

            <div className="topbar-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search your workspace..."
              />
              <kbd>⌘ K</kbd>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-create"
              type="button"
              onClick={() =>
                navigate(
                  "/workspace"
                )
              }
            >
              <Plus size={17} />
              <span>
                New generation
              </span>
            </button>

            <button
              className="icon-button notification-button"
              type="button"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <button
              className="topbar-avatar"
              type="button"
              onClick={() =>
                navigate("/profile")
              }
            >
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
            </button>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

const SparklesIcon = () => (
  <Sparkles size={17} />
);

export default AppShell;
