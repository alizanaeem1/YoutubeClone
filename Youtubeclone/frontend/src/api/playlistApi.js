import api from "./axios";

export const getPlaylistsApi = () => api.get("/playlists");
export const createPlaylistApi = (payload) => api.post("/playlists", payload);
export const getPlaylistApi = (id) => api.get(`/playlists/${id}`);
export const addVideoToPlaylistApi = (playlistId, videoId) =>
  api.post(`/playlists/${playlistId}/videos`, { videoId });
export const removeVideoFromPlaylistApi = (playlistId, videoId) =>
  api.delete(`/playlists/${playlistId}/videos/${videoId}`);
