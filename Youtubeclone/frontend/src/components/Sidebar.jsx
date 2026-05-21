import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      );
    case "shorts":
      return (
        <svg {...common}>
          <path d="M9 3l8 4-4 3 4 3-8 8-2-7 4-3-4-3 2-5z" />
        </svg>
      );
    case "subs":
      return (
        <svg {...common}>
          <path d="M4 4h16v14H5a1 1 0 0 1-1-1V4z" />
          <path d="M8 10h8M8 14h6" />
          <path d="M6 20l2-2" />
        </svg>
      );
    case "channel":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "playlists":
      return (
        <svg {...common}>
          <path d="M4 7h12" />
          <path d="M4 12h10" />
          <path d="M4 17h8" />
          <path d="M17 14l4 3-4 3v-6z" />
        </svg>
      );
    case "you":
      return (
        <svg {...common}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="M7 9l5-5 5 5" />
          <path d="M4 20h16" />
        </svg>
      );
    case "liked":
      return (
        <svg {...common}>
          <path d="M12 21s-7-4.5-9-8.5C1 9.5 2.7 7 5.5 7c1.6 0 3 .9 3.8 2 0.8-1.1 2.2-2 3.8-2C15.8 7 17.5 9.5 16.9 12.5c-2 4-4.9 8.5-4.9 8.5z" />
        </svg>
      );
    case "watchLater":
      return (
        <svg {...common}>
          <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "videos":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M10 9l5 3-5 3V9z" />
        </svg>
      );
    case "downloads":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="M7 10l5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar({ onItemClick }) {
  const { user } = useAuth();

  const youLinks = [
    { to: "/my-channel", label: "Your channel", icon: "channel" },
    { to: "/history", label: "History", icon: "history" },
    { to: "/playlists", label: "Playlists", icon: "playlists" },
    { to: "/watch-later", label: "Watch later", icon: "watchLater" },
    { to: "/liked", label: "Liked videos", icon: "liked" },
    { to: "/my-channel", label: "Your videos", icon: "videos" },
    { to: "/downloads", label: "Downloads", icon: "downloads" }
  ];

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-item" onClick={onItemClick}>
        <span className="sidebar-icon">
          <Icon name="home" />
        </span>
        <span className="sidebar-label">Home</span>
      </NavLink>

      <NavLink to="/shorts" className="sidebar-item" onClick={onItemClick}>
        <span className="sidebar-icon">
          <Icon name="shorts" />
        </span>
        <span className="sidebar-label">Shorts</span>
      </NavLink>

      {user && (
        <NavLink to="/subscriptions" className="sidebar-item" onClick={onItemClick}>
          <span className="sidebar-icon">
            <Icon name="subs" />
          </span>
          <span className="sidebar-label">Subscriptions</span>
        </NavLink>
      )}

      {user && (
        <details className="sidebar-section sidebar-you-section">
          <summary className="sidebar-item sidebar-parent">
            <span className="sidebar-icon">
              <Icon name="you" />
            </span>
            <span className="sidebar-label">You</span>
          </summary>
          <div className="sidebar-flyout">
            <div className="sidebar-flyout-title">You</div>
            {youLinks.map((item) => (
              <NavLink key={`${item.to}-${item.label}`} to={item.to} className="sidebar-flyout-item" onClick={onItemClick}>
                <span className="sidebar-flyout-icon">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </details>
      )}

      {/* Upload option removed from sidebar (top navbar still has Upload). */}
    </aside>
  );
}

export default Sidebar;
