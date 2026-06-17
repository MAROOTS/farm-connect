import api from "./axios";

export const marketplaceApi = {
  getListings: (category) =>
    api.get("/marketplace/listings", { params: { category } }),

  getMyListings: () => api.get("/marketplace/listings/my"),

  createListing: (data) => api.post("/marketplace/listings", data),

  placeOrder: (data) => api.post("/marketplace/orders", data),

  verifyPayment: (data) => api.post("/marketplace/orders/verify-payment", data),

  getMyOrders: () => api.get("/marketplace/orders/my"),
  
  submitReview: (orderId, rating) =>
    api.post("/marketplace/reviews", { orderId, rating }),

  getFarmerRating: (farmerId) =>
    api.get(`/marketplace/reviews/farmer/${farmerId}`),

  checkReviewExists: (orderId) =>
    api.get(`/marketplace/reviews/order/${orderId}/exists`),
};
