import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPlaylistApi, getPlaylistsApi } from "../api/playlistApi";
import LoaderSkeleton from "../components/LoaderSkeleton";
import { resolveMediaUrl } from "../utils/media";

function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  const loadPlaylists = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPlaylistsApi();
      setPlaylists(res.data);
    } catch {
      setError("Failed to load playlists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await createPlaylistApi(form);
      setPlaylists((current) => [res.data, ...current]);
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create playlist.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoaderSkeleton />;

  return (
    <section>
      <div className="home-header" style={{ marginBottom: "20px" }}>
        <h2 className="page-heading" style={{ margin: 0 }}>Playlists</h2>
      </div>

      <form className="playlist-create-form" onSubmit={createPlaylist}>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Playlist name"
          required
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description optional"
        />
        <button type="submit" className="btn-signin" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </button>
      </form>

      {error ? <p className="text-error">{error}</p> : null}

      {!playlists.length ? (
        <p className="text-secondary">No playlists yet.</p>
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist) => {
            const cover = playlist.videos?.[0]?.thumbnailUrl;
            return (
              <Link to={`/playlists/${playlist._id}`} className="playlist-card" key={playlist._id}>
                <div className="playlist-cover">
                  {cover ? <img src={resolveMediaUrl(cover)} alt="" /> : <span>{playlist.name.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="playlist-card-body">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.videos?.length || 0} videos</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PlaylistsPage;
