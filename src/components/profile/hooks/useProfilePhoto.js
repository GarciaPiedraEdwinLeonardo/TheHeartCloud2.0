// hooks/useProfilePhoto.js
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";
import cloudinaryConfig from "../../../config/cloudinary";

export const useProfilePhoto = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profile");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir la imagen a Cloudinary");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error("Error subiendo a Cloudinary:", err);
      throw new Error("No se pudo subir la imagen");
    }
  };

  const uploadProfilePhoto = async (file) => {
    if (!auth.currentUser) {
      setError("Usuario no autenticado");
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("Solo se permiten archivos de imagen (JPG, PNG, WEBP)");
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB");
      }

      const userId = auth.currentUser.uid;

      // Subir a Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Actualizar perfil del usuario en Firestore
      await updateDoc(doc(db, "users", userId), {
        photoURL: cloudinaryUrl,
        lastUpdated: new Date(),
      });

      return cloudinaryUrl;
    } catch (err) {
      console.error("Error subiendo foto de perfil:", err);
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePhoto = async () => {
    if (!auth.currentUser) return;

    try {
      setUploading(true);

      // Actualizar Firestore (en Cloudinary la imagen permanece, pero la quitamos del perfil)
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("Error eliminando foto de perfil:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfilePhoto,
    deleteProfilePhoto,
    uploading,
    error,
    clearError: () => setError(null),
  };
};
