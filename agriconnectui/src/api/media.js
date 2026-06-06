import api from "./axios";

export const mediaApi = {
  uploadListingImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/media/upload/listing", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadFarmImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/media/upload/farm", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
