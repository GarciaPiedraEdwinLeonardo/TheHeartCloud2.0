import { useState } from "react";
import cloudinaryConfig from "./../../../../config/cloudinary";

export const usePostUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);

    try {
      // Validaciones
      if (!file) throw new Error("No se seleccionó ningún archivo");

      const MAX_SIZE = 2 * 1024 * 1024;
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (file.size > MAX_SIZE) {
        throw new Error("La imagen debe ser menor a 2MB");
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Solo se permiten imágenes JPEG, PNG, GIF o WebP");
      }

      // Crear FormData para Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "publicaciones"); // Tu upload preset de Cloudinary

      // Subir a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error subiendo imagen");

      const data = await response.json();

      // Crear objeto de imagen para Firestore
      const imageData = {
        url: data.secure_url,
        thumbnailUrl: data.secure_url, // Podrías generar thumbnail si quieres
        storagePath: data.public_id,
        filename: file.name,
        size: file.size,
        dimensions: {
          width: data.width,
          height: data.height,
        },
        uploadedAt: new Date(),
      };

      return { success: true, image: imageData };
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    error,
  };
};
