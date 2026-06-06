import api from "./axios";
export const farmApi = {
  getMyFarm: () => api.get("/farms/my"),
  registerFarm: (data) => api.post("/farms", data),
  updateFarm: (data) => api.put("/farms/my", data),

  getMyCrops: () => api.get("/farms/crops"),
  addCrop: (data) => api.post("/farms/crops", data),
  updateCrop: (id, status) =>
    api.patch(`/farms/crops/${id}/status`, null, { params: { status } }),

  getMyTasks: () => api.get("/farms/tasks"),
  getOverdue: () => api.get("/farms/tasks/overdue"),
  createTask: (data) => api.post("/farms/tasks", data),
  completeTask: (id) => api.patch(`/farms/tasks/${id}/complete`),
};
