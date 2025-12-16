import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
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

  const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) {
        console.warn(
          "Backend no configurado - imagen permanecerá en Cloudinary"
        );
        return;
      }

      const response = await fetch(`${backendUrl}/api/deleteCloudinaryImage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.warn(
          "No se pudo eliminar la imagen de Cloudinary:",
          result.error
        );
      }
    } catch (err) {
      console.warn("Error eliminando imagen de Cloudinary:", err);
    }
  };

  const getCurrentPhotoURL = async () => {
    if (!auth.currentUser) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data().photoURL || null;
      }
    } catch (err) {
      console.error("Error obteniendo foto actual:", err);
    }
    return null;
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

      // Obtener la foto actual antes de subir la nueva
      const currentPhotoURL = await getCurrentPhotoURL();

      // Subir nueva imagen a Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Actualizar perfil del usuario en Firestore
      await updateDoc(doc(db, "users", userId), {
        photoURL: cloudinaryUrl,
        lastUpdated: new Date(),
      });

      // Eliminar la foto anterior de Cloudinary (si existía)
      if (currentPhotoURL) {
        await deleteFromCloudinary(currentPhotoURL);
      }

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
      setError(null);

      const userId = auth.currentUser.uid;

      // Obtener la foto actual
      const currentPhotoURL = await getCurrentPhotoURL();

      // Actualizar Firestore primero
      await updateDoc(doc(db, "users", userId), {
        photoURL: null,
        lastUpdated: new Date(),
      });

      // Eliminar de Cloudinary
      if (currentPhotoURL) {
        await deleteFromCloudinary(currentPhotoURL);
      }
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
