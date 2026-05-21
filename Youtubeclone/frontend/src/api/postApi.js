import api from "./axios";

export const getMyPostsApi = () => api.get("/posts");
export const createPostApi = (formData) =>
  api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
export const updatePostStatusApi = (id, status) => api.patch(`/posts/${id}/status`, { status });
