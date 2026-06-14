import api from "./axios";

export const adminApi = {
  // User management
  getStats: () => api.get("/admin/stats"),
  getAllUsers: () => api.get("/admin/users"),
  toggleActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),

  // Listing management
  getAllListings: () => api.get("/marketplace/admin/all-listings"),
  updateListing: (id, s) =>
    api.patch(`/marketplace/admin/listings/${id}/status`, null, {
      params: { status: s },
    }),
  deleteListing: (id) => api.delete(`/marketplace/admin/listings/${id}`),

  // Order management
  getAllOrders: () => api.get("/marketplace/admin/all-orders"),
  updateOrder: (id, s) =>
    api.patch(`/marketplace/admin/orders/${id}/status`, null, {
      params: { status: s },
    }),
};
