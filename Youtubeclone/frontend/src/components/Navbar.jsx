import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { resolveMediaUrl } from "../utils/media";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi";

function Navbar({ sidebarOpen, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { dark, setDark } = useTheme();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const createRef = useRef(null);
  const notificationsRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q") || "";
    setQ(query);
  }, [location.search]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        if (!active) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        if (!active) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
  };

  const clearSearch = () => {
    setQ("");
    navigate("/");
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceMessage("Listening...");
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage("Could not hear clearly");
      window.setTimeout(() => setVoiceMessage(""), 1600);
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      setQ(transcript);
      setVoiceMessage(transcript ? `Searching for "${transcript}"` : "");
      window.setTimeout(() => setVoiceMessage(""), 1600);
      if (transcript) navigate(`/?q=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const closeVoiceSearch = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceMessage("");
  };

  const notificationText = (notification) => {
    const actor = notification.actor?.name || "Someone";
    const title = notification.video?.title ? ` "${notification.video.title}"` : "";
    if (notification.type === "comment") return `${actor} commented on${title}`;
    if (notification.type === "like") return `${actor} liked${title}`;
    if (notification.type === "subscription") return `${actor} subscribed to your channel`;
    if (notification.type === "upload") return `${actor} uploaded${title}`;
    return "New notification";
  };

  const notificationTime = (date) => {
    if (!date) return "";
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (seconds < 60) return "now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      setNotifications((items) => items.map((item) => (item._id === notification._id ? { ...item, read: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await markNotificationRead(notification._id);
      } catch {
        // The next poll will reconcile the local optimistic state.
      }
    }
    setNotificationsOpen(false);
    if (notification.video?._id) navigate(`/watch/${notification.video._id}`);
    else navigate("/my-channel");
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // The next poll will reconcile the local optimistic state.
    }
  };

  return (
    <nav className="navbar">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
        aria-expanded={sidebarOpen ? "true" : "false"}
      >
        <span className="hamburger-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <Link to="/" className="brand">
        <span className="brand-logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" stroke="url(#tg)" strokeWidth="2" />
            <path d="M10.2 8.9V15.1L15.4 12L10.2 8.9Z" fill="url(#tg)" />
          </svg>
        </span>
        <span className="brand-text"><span className="brand-accent">Stream</span>Tube</span>
      </Link>
      <form className="navbar-search" onSubmit={onSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search videos"
          aria-label="Search videos"
        />
        {q && (
          <button type="button" className="btn-search-clear" onClick={clearSearch} aria-label="Clear search">
            ×
          </button>
        )}
        <button type="submit" className="btn-search" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`btn-voice-search ${isListening ? "listening" : ""}`}
          onClick={startVoiceSearch}
          aria-label={isListening ? "Listening for voice search" : "Voice search"}
          title={isListening ? "Listening..." : "Voice search"}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="2" />
            <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>
      {(isListening || voiceMessage) && (
        <div className="voice-recording-popover" role="status" aria-live="polite">
          <span className="voice-recording-ring" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="2" />
              <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <strong>{isListening ? "Recording" : "Voice search"}</strong>
            <small>{voiceMessage || "Speak now"}</small>
          </span>
          <button
            type="button"
            className="voice-recording-close"
            onClick={closeVoiceSearch}
            aria-label="Close voice search"
          >
            ×
          </button>
        </div>
      )}
      <div className="navbar-actions">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setDark(!dark)}
          title={dark ? "Light mode" : "Dark mode"}
          aria-label="Toggle theme"
        >
          {dark ? "☀" : "☾"}
        </button>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="create-menu-wrap" ref={createRef}>
              <button
                type="button"
                className="btn-signin btn-create"
                onClick={() => setCreateOpen((open) => !open)}
                aria-expanded={createOpen ? "true" : "false"}
                aria-label="Create"
              >
                <span aria-hidden="true">+</span>
                Create
              </button>
              {createOpen && (
                <div className="create-menu">
                  <Link to="/upload" className="create-menu-item" onClick={() => setCreateOpen(false)}>
                    <span className="create-menu-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                      </svg>
                    </span>
                    Upload video
                  </Link>
                  <Link to="/create-short" className="create-menu-item" onClick={() => setCreateOpen(false)}>
                    <span className="create-menu-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
                        <path d="M11 9l4 3-4 3V9z" fill="currentColor" />
                      </svg>
                    </span>
                    Create Short
                  </Link>
                  <Link to="/create-post" className="create-menu-item" onClick={() => setCreateOpen(false)}>
                    <span className="create-menu-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M4 20h4l11-11-4-4L4 16v4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    Create post
                  </Link>
                </div>
              )}
            </div>
            <div className="notifications-wrap" ref={notificationsRef}>
              <button
                type="button"
                className="btn-icon notification-button"
                onClick={() => setNotificationsOpen((v) => !v)}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={notificationsOpen ? "true" : "false"}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21A2 2 0 0 1 10.27 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              {notificationsOpen && (
                <div className="notifications-menu">
                  <div className="notifications-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button type="button" onClick={markAllRead}>
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          className={`notification-item ${notification.read ? "" : "notification-item-unread"}`}
                          onClick={() => openNotification(notification)}
                        >
                          <span className="notification-avatar">
                            {notification.actor?.avatar ? (
                              <img src={resolveMediaUrl(notification.actor.avatar)} alt="" />
                            ) : (
                              notification.actor?.name?.charAt(0)?.toUpperCase() || "N"
                            )}
                          </span>
                          <span className="notification-copy">
                            <span>{notificationText(notification)}</span>
                            <small>{notificationTime(notification.createdAt)}</small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="notifications-empty">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="account-menu-wrap" ref={dropdownRef}>
              <button 
                type="button" 
                onClick={() => setProfileOpen(!profileOpen)}
                className="account-avatar-button"
                aria-label="Account menu"
                aria-expanded={profileOpen ? "true" : "false"}
              >
                {user.avatar ? (
                  <img src={resolveMediaUrl(user.avatar)} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </button>
              {profileOpen && (
                <div className="account-menu">
                  <div className="account-menu-header">
                    <span className="account-menu-avatar">
                      {user.avatar ? (
                        <img src={resolveMediaUrl(user.avatar)} alt="" />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase()
                      )}
                    </span>
                    <span className="account-menu-copy">
                      <strong>{user.name}</strong>
                      <span>@{user.username || user.handle || `${user.name?.toLowerCase().replace(/\s+/g, "")}-${user._id?.slice(-5) || "user"}`}</span>
                    </span>
                  </div>
                  <Link to="/my-channel" className="account-menu-item account-menu-link-primary" onClick={() => setProfileOpen(false)}>
                    View your channel
                  </Link>
                  <button type="button" className="account-menu-item account-menu-danger" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/auth" className="btn-signin">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
