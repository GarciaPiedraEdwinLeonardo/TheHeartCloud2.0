const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, // Tu cloud name de Cloudinary
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY, // Tu API Key de Cloudinary
  uploadPresets: {
    licenses: "licenses",
    avatars: "avatars",
    posts: "posts",
    temp: "temp",
    forums: "forums",
  },
};

export default cloudinaryConfig;
