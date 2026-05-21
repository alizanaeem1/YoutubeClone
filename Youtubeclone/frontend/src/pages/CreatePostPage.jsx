import { useEffect, useMemo, useState } from "react";
import { createPostApi, getMyPostsApi, updatePostStatusApi } from "../api/postApi";
import LoaderSkeleton from "../components/LoaderSkeleton";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/media";

function CreatePostPage() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("published");

  const mediaKind = useMemo(() => {
    if (!mediaFile) return "";
    if (mediaFile.type.startsWith("video/")) return "video";
    if (mediaFile.type.startsWith("image/")) return "image";
    return "";
  }, [mediaFile]);

  useEffect(() => {
    getMyPostsApi()
      .then((res) => setPosts(res.data))
      .catch(() => setError("Failed to load posts."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview("");
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const resetForm = () => {
    setDescription("");
    setMediaFile(null);
    setPollEnabled(false);
    setPollOptions(["", ""]);
  };

  const savePost = async (e, status = "published") => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("description", description);
      fd.append("status", status);
      if (mediaFile) fd.append("media", mediaFile);
      if (pollEnabled) {
        fd.append("pollOptions", JSON.stringify(pollOptions.map((option) => option.trim()).filter(Boolean)));
      }
      const res = await createPostApi(fd);
      setPosts((current) => [res.data, ...current]);
      setActiveTab(status);
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish post.");
    } finally {
      setSaving(false);
    }
  };

  const updatePollOption = (index, value) => {
    setPollOptions((current) => current.map((option, i) => (i === index ? value : option)));
  };

  const changePostStatus = async (postId, status) => {
    const res = await updatePostStatusApi(postId, status);
    setPosts((current) => current.map((post) => (post._id === postId ? res.data : post)));
    setActiveTab(status);
  };

  const visiblePosts = posts.filter((post) => (post.status || "published") === activeTab);

  if (loading) return <LoaderSkeleton />;

  return (
    <section className="community-page">
      <div className="community-hero">
        <div className="community-avatar">
          {user?.avatar ? <img src={resolveMediaUrl(user.avatar)} alt={user.name} /> : user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1>{user?.name || "Your channel"}</h1>
          <p>@{user?.name?.replace(/\s+/g, "")?.toLowerCase() || "channel"}</p>
        </div>
      </div>

      <div className="community-banner">
        <strong>Connect with your Community</strong>
        <span>Share updates, media, and polls with your audience.</span>
      </div>

      <form className="post-composer" onSubmit={(e) => savePost(e, "published")}>
        <div className="post-composer-top">
          <div className="post-mini-avatar">
            {user?.avatar ? <img src={resolveMediaUrl(user.avatar)} alt="" /> : user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || "You"}</strong>
            <span>Visibility: Public</span>
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share something with your audience"
          rows={4}
        />

        {mediaPreview && (
          <div className="post-preview">
            {mediaKind === "video" ? (
              <video src={mediaPreview} controls />
            ) : (
              <img src={mediaPreview} alt="Post preview" />
            )}
            <button type="button" className="btn-ghost" onClick={() => setMediaFile(null)}>
              Remove media
            </button>
          </div>
        )}

        {pollEnabled && (
          <div className="poll-editor">
            {pollOptions.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            ))}
            <button type="button" className="btn-ghost" onClick={() => setPollOptions((current) => [...current, ""])}>
              Add option
            </button>
          </div>
        )}

        <div className="post-tools">
          <label className="post-tool">
            Image
            <input type="file" accept="image/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
          </label>
          <label className="post-tool">
            Video
            <input type="file" accept="video/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
          </label>
          <button type="button" className={`post-tool ${pollEnabled ? "active" : ""}`} onClick={() => setPollEnabled((value) => !value)}>
            Text poll
          </button>
        </div>

        {error ? <p className="text-error">{error}</p> : null}

        <div className="post-actions">
          <button type="button" className="btn-ghost" onClick={resetForm} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-ghost" onClick={(e) => savePost(e, "draft")} disabled={saving}>
            Save draft
          </button>
          <button type="submit" className="btn-signin" disabled={saving}>
            {saving ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      <div className="community-tabs">
        <button type="button" className={activeTab === "published" ? "active" : ""} onClick={() => setActiveTab("published")}>
          Published
        </button>
        <button type="button" className={activeTab === "draft" ? "active" : ""} onClick={() => setActiveTab("draft")}>
          Scheduled
        </button>
        <button type="button" className={activeTab === "archived" ? "active" : ""} onClick={() => setActiveTab("archived")}>
          Archived
        </button>
      </div>

      {!visiblePosts.length ? (
        <p className="text-secondary">
          {activeTab === "published" && "No published posts yet."}
          {activeTab === "draft" && "No draft posts yet."}
          {activeTab === "archived" && "No archived posts yet."}
        </p>
      ) : (
        <div className="post-list">
          {visiblePosts.map((post) => (
            <article className="community-post" key={post._id}>
              <div className="post-composer-top">
                <div className="post-mini-avatar">
                  {post.owner?.avatar ? <img src={resolveMediaUrl(post.owner.avatar)} alt="" /> : post.owner?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <strong>{post.owner?.name || "You"}</strong>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {post.description ? <p>{post.description}</p> : null}
              {post.mediaUrl && post.mediaType === "image" ? <img className="community-post-media" src={resolveMediaUrl(post.mediaUrl)} alt="" /> : null}
              {post.mediaUrl && post.mediaType === "video" ? <video className="community-post-media" src={resolveMediaUrl(post.mediaUrl)} controls /> : null}
              {post.pollOptions?.length ? (
                <div className="poll-view">
                  {post.pollOptions.map((option) => (
                    <div key={option.text}>{option.text}</div>
                  ))}
                </div>
              ) : null}
              <div className="post-status-actions">
                {activeTab === "published" && (
                  <button type="button" className="btn-ghost" onClick={() => changePostStatus(post._id, "archived")}>
                    Archive
                  </button>
                )}
                {activeTab === "draft" && (
                  <button type="button" className="btn-signin" onClick={() => changePostStatus(post._id, "published")}>
                    Publish
                  </button>
                )}
                {activeTab === "archived" && (
                  <button type="button" className="btn-ghost" onClick={() => changePostStatus(post._id, "published")}>
                    Restore
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CreatePostPage;
