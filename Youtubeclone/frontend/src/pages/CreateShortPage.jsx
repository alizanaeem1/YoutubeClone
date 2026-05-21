import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideoApi } from "../api/videoApi";

function CreateShortPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!video) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(video);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description || "Short video");
    fd.append("category", "Shorts");
    fd.append("video", video);
    try {
      setUploading(true);
      await uploadVideoApi(fd);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Short upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="short-create-page">
      <div className="home-header" style={{ marginBottom: "20px" }}>
        <h2 className="page-heading" style={{ margin: 0 }}>Create Short</h2>
      </div>

      <div className="short-create-layout">
        <form className="short-create-form" onSubmit={submit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} />
          <label>
            Select vertical video
            <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} required />
          </label>
          <small className="text-secondary">{video ? video.name : "Choose a short video file."}</small>
          {error ? <p className="text-error">{error}</p> : null}
          <button type="submit" className="btn-signin" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Short"}
          </button>
        </form>

        <div className="short-phone-preview">
          {preview ? <video src={preview} controls /> : <span>9:16 preview</span>}
        </div>
      </div>
    </section>
  );
}

export default CreateShortPage;
