import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addVideoToPlaylistApi, createPlaylistApi, getPlaylistsApi } from "../api/playlistApi";
import { toggleWatchLaterApi } from "../api/videoApi";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/media";

function VideoCard({ video, canManage = false, onEdit, onDelete }) {
  const { user } = useAuth();
  const thumbnailSrc = video.thumbnailUrl
    ? resolveMediaUrl(video.thumbnailUrl)
    : "https://placehold.co/480x270?text=No+Thumbnail";

  const avatarSrc = video.owner?.avatar ? resolveMediaUrl(video.owner.avatar) : "";
  const ownerId = video.owner?._id ? String(video.owner._id) : "";

  const formatDuration = (seconds) => {
    const sec = Math.floor(Number(seconds) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatViews = (n) => {
    const num = Number(n) || 0;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M views`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K views`;
    return `${num} views`;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 0) return "just now";
    
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
    return "just now";
  };

  const durationLabel = video.duration && Number(video.duration) > 0 ? formatDuration(video.duration) : "";
  const [computedDuration, setComputedDuration] = useState(null);
  const durationLabelComputed =
    computedDuration && Number(computedDuration) > 0 ? formatDuration(computedDuration) : "";

  useEffect(() => {
    if (video.duration && Number(video.duration) > 0) return;
    if (!video.videoUrl) return;

    let cancelled = false;
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.crossOrigin = "anonymous";

    const onLoaded = () => {
      if (cancelled) return;
      if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
        setComputedDuration(videoEl.duration);
      }
    };

    const onError = () => {};

    videoEl.addEventListener("loadedmetadata", onLoaded);
    videoEl.addEventListener("error", onError);
    videoEl.src = resolveMediaUrl(video.videoUrl);

    return () => {
      cancelled = true;
      videoEl.removeEventListener("loadedmetadata", onLoaded);
      videoEl.removeEventListener("error", onError);
      videoEl.src = "";
    };
  }, [video._id, video.videoUrl, video.duration]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [hidden, setHidden] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistMessage, setPlaylistMessage] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      const el = menuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!playlistDialogOpen || !user) return;
    getPlaylistsApi()
      .then((res) => setPlaylists(res.data))
      .catch(() => setPlaylists([]));
  }, [playlistDialogOpen, user]);

  const saveForLater = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await toggleWatchLaterApi(video._id);
      setSavedMessage(res.data.saved ? "Saved" : "Removed");
    } catch {
      setSavedMessage("Failed");
    } finally {
      window.setTimeout(() => setSavedMessage(""), 1400);
    }
  };

  const addToPlaylist = async (playlistId) => {
    await addVideoToPlaylistApi(playlistId, video._id);
    setPlaylistMessage("Added to playlist");
    setPlaylistDialogOpen(false);
    window.setTimeout(() => setPlaylistMessage(""), 1400);
  };

  const createAndAddPlaylist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!playlistName.trim()) return;
    const res = await createPlaylistApi({ name: playlistName });
    setPlaylists((current) => [res.data, ...current]);
    setPlaylistName("");
    await addToPlaylist(res.data._id);
  };

  const stopCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (hidden) {
    return (
      <article className="video-card video-card-hidden">
        <p>This video was hidden.</p>
        <button type="button" className="btn-ghost" onClick={() => setHidden(false)}>
          Undo
        </button>
      </article>
    );
  }

  return (
    <article className="video-card" aria-label={`Video: ${video.title}`} style={{ position: 'relative', zIndex: menuOpen ? 50 : 1 }}>
      <div className="video-thumb">
        <Link to={`/watch/${video._id}`} className="video-thumb-link">
          <img className="video-thumb-img" src={thumbnailSrc} alt={video.title} />
        </Link>

        {durationLabel || durationLabelComputed ? (
          <div className="video-duration">{durationLabel || durationLabelComputed}</div>
        ) : null}
      </div>

      <div className="video-meta">
        <div className="video-row" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0, paddingRight: '34px' }}>
            {ownerId ? (
              <Link to={`/channel/${ownerId}`} className="channel-avatar channel-avatar-link">
                {avatarSrc ? <img src={avatarSrc} alt={video.owner?.name || "Channel"} /> : null}
              </Link>
            ) : (
              <div className="channel-avatar">
                {avatarSrc ? <img src={avatarSrc} alt={video.owner?.name || "Channel"} /> : null}
              </div>
            )}
            <div className="video-text" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <h4 className="video-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</h4>
              <div className="video-sub" style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                {ownerId ? (
                  <Link to={`/channel/${ownerId}`} className="video-channel" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                    {video.owner?.name || "Unknown"}
                  </Link>
                ) : (
                  <span className="video-channel" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{video.owner?.name || "Unknown"}</span>
                )}
                <span style={{ fontSize: '0.8rem' }}>•</span>
                <span className="video-views">{formatViews(video.views)}</span>
                {video.createdAt && (
                  <>
                    <span style={{ fontSize: '0.8rem' }}>•</span>
                    <span className="video-time">{formatTimeAgo(video.createdAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div ref={menuRef} style={{ position: 'absolute', right: '-8px', top: '-8px' }}>
            <button
              type="button"
              className="btn-ghost video-card-menu-button"
              aria-label="Video actions"
              aria-expanded={menuOpen ? "true" : "false"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="video-more-menu video-card-menu" role="menu" aria-label="Video menu">
                {user && (
                  <button type="button" className="video-more-item" onClick={saveForLater}>
                    {savedMessage || "Save to Watch Later"}
                  </button>
                )}

                {user && (
                  <button
                    type="button"
                    className="video-more-item"
                    onClick={(e) => {
                      stopCardClick(e);
                      setMenuOpen(false);
                      setPlaylistDialogOpen(true);
                    }}
                  >
                    Add to playlist
                  </button>
                )}

                <a
                  className="video-more-item"
                  href={resolveMediaUrl(video.videoUrl)}
                  download
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>

                <button
                  type="button"
                  className="video-more-item"
                  onClick={(e) => {
                    stopCardClick(e);
                    setHidden(true);
                    setMenuOpen(false);
                  }}
                >
                  Not interested
                </button>

                {canManage && (
                  <>
                    <button
                      type="button"
                      className="video-more-item"
                      onClick={(e) => {
                        stopCardClick(e);
                        setMenuOpen(false);
                        onEdit?.(video);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="video-more-item video-more-item-danger"
                      onClick={(e) => {
                        stopCardClick(e);
                        setMenuOpen(false);
                        onDelete?.(video._id);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {playlistDialogOpen && (
        <div className="mini-modal-backdrop" onMouseDown={() => setPlaylistDialogOpen(false)}>
          <div className="mini-modal playlist-dialog" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mini-modal-header">
              <h3>Add to playlist</h3>
              <button type="button" className="btn-ghost" onClick={() => setPlaylistDialogOpen(false)}>
                ×
              </button>
            </div>

            {playlists.length ? (
              <div className="playlist-dialog-list">
                {playlists.map((playlist) => (
                  <button type="button" key={playlist._id} onClick={() => addToPlaylist(playlist._id)}>
                    {playlist.name}
                    <span>{playlist.videos?.length || 0} videos</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-secondary">No playlists yet. Create one below.</p>
            )}

            <form className="playlist-dialog-form" onSubmit={createAndAddPlaylist}>
              <label>
                Playlist name
                <input
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="New playlist"
                  autoFocus
                />
              </label>
              <button type="submit" className="btn-signin">
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

export default VideoCard;
