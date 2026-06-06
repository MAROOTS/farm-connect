import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data),

  requestOtp: (email) => api.post("/auth/otp/request", { email }),

  verifyOtp: (email, otp) => api.post("/auth/otp/verify", { email, otp }),
};
