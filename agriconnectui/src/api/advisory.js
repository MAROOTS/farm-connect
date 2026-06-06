import api from "./axios";

export const advisoryApi = {
  getByCity: (city) => api.get("/advisory", { params: { city } }),
  getByCoords: (lat, lon) =>
    api.get("/advisory/coords", { params: { lat, lon } }),
};
