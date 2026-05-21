import { useEffect, useState } from "react";
import { getWatchLaterVideosApi } from "../api/videoApi";
import LoaderSkeleton from "../components/LoaderSkeleton";
import VideoCard from "../components/VideoCard";

function WatchLaterPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getWatchLaterVideosApi();
        setVideos(res.data);
      } catch {
        setError("Failed to load Watch Later videos.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <LoaderSkeleton />;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <section>
      <div className="home-header" style={{ marginBottom: "20px" }}>
        <h2 className="page-heading" style={{ margin: 0 }}>Watch Later</h2>
      </div>

      {!videos.length ? (
        <p className="text-secondary">No videos saved for later yet.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </section>
  );
}

export default WatchLaterPage;
