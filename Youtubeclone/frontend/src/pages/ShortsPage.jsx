import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dislikeVideoApi, getVideosApi, likeVideoApi } from "../api/videoApi";
import LoaderSkeleton from "../components/LoaderSkeleton";
import { resolveMediaUrl } from "../utils/media";

function ShortsPage() {
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVideosApi("", "Shorts")
      .then((res) => setVideos(res.data))
      .catch(() => setError("Failed to load Shorts."))
      .finally(() => setLoading(false));
  }, []);

  const current = videos[index];

  const move = (direction) => {
    setIndex((value) => {
      const next = value + direction;
      if (next < 0) return 0;
      if (next >= videos.length) return videos.length - 1;
      return next;
    });
  };

  const refreshCurrent = async (action) => {
    if (!current?._id) return;
    await action(current._id);
    const res = await getVideosApi("", "Shorts");
    setVideos(res.data);
  };

  if (loading) return <LoaderSkeleton />;
  if (error) return <p className="text-error">{error}</p>;
  if (!current) return <p className="text-secondary">No Shorts uploaded yet.</p>;

  return (
    <section className="shorts-viewer">
      <div className="shorts-stage">
        <video
          key={current._id}
          className="shorts-video"
          src={resolveMediaUrl(current.videoUrl)}
          controls
          autoPlay
          loop
          playsInline
        />

        <div className="shorts-overlay">
          <div className="shorts-channel-row">
            <Link to={`/channel/${current.owner?._id}`} className="shorts-avatar">
              {current.owner?.avatar ? <img src={resolveMediaUrl(current.owner.avatar)} alt="" /> : current.owner?.name?.charAt(0)?.toUpperCase()}
            </Link>
            <Link to={`/channel/${current.owner?._id}`} className="shorts-channel-name">
              @{current.owner?.name || "creator"}
            </Link>
            <button type="button" className="shorts-subscribe">Subscribe</button>
          </div>
          <h1>{current.title}</h1>
          {current.description ? <p>{current.description}</p> : null}
        </div>
      </div>

      <div className="shorts-actions">
        <button type="button" onClick={() => refreshCurrent(likeVideoApi)}>
          <span>👍</span>
          <strong>{current.likes?.length || 0}</strong>
        </button>
        <button type="button" onClick={() => refreshCurrent(dislikeVideoApi)}>
          <span>👎</span>
          <strong>Dislike</strong>
        </button>
        <button type="button">
          <span>💬</span>
          <strong>Comments</strong>
        </button>
      </div>

      <div className="shorts-nav">
        <button type="button" onClick={() => move(-1)} disabled={index === 0} aria-label="Previous Short">↑</button>
        <button type="button" onClick={() => move(1)} disabled={index === videos.length - 1} aria-label="Next Short">↓</button>
      </div>
    </section>
  );
}

export default ShortsPage;
