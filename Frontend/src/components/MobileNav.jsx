
import {
  FolderKanban,
  History,
  Home,
  Sparkles
} from "lucide-react";

import {
  NavLink
} from "react-router-dom";

const MobileNav = () => {
  const links = [
    {
      label: "Home",
      path: "/dashboard",
      icon: Home
    },
    {
      label: "AI",
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
    }
  ];

  return (
    <nav className="mobile-nav">
      {links.map(
        ({
          label,
          path,
          icon: Icon
        }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `mobile-nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        )
      )}
    </nav>
  );
};

export default MobileNav;
