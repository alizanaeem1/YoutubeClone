import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistApi, removeVideoFromPlaylistApi } from "../api/playlistApi";
import LoaderSkeleton from "../components/LoaderSkeleton";
import VideoCard from "../components/VideoCard";

function PlaylistDetailPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlaylist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPlaylistApi(id);
      setPlaylist(res.data);
    } catch {
      setError("Failed to load playlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const removeVideo = async (videoId) => {
    await removeVideoFromPlaylistApi(id, videoId);
    setPlaylist((current) => ({
      ...current,
      videos: current.videos.filter((video) => video._id !== videoId)
    }));
  };

  if (loading) return <LoaderSkeleton />;
  if (error) return <p className="text-error">{error}</p>;
  if (!playlist) return null;

  return (
    <section>
      <div className="home-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2 className="page-heading" style={{ margin: 0 }}>{playlist.name}</h2>
          {playlist.description ? <p className="text-secondary">{playlist.description}</p> : null}
        </div>
      </div>

      {!playlist.videos.length ? (
        <p className="text-secondary">No videos in this playlist yet.</p>
      ) : (
        <div className="video-grid">
          {playlist.videos.map((video) => (
            <div key={video._id} className="playlist-video-wrap">
              <VideoCard video={video} />
              <button type="button" className="btn-ghost playlist-remove-btn" onClick={() => removeVideo(video._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PlaylistDetailPage;
