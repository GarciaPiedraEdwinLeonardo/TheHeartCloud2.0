// src/services/cloudinary.js
class CloudinaryService {
  constructor() {
    this.cloudName = "dbaeblapg"; // Reemplaza con tu cloud name
    this.uploadPreset = "theheartcloud";
    this.baseFolder = "theheartcloud";
  }

  // Subir archivo con estructura organizada
  async uploadFile(file, options = {}) {
    const {
      folderType = "temp", // 'licenses', 'avatars', 'posts', 'forums', 'temp'
      userId = null,
      postId = null,
      forumId = null,
      resourceType = "auto",
    } = options;

    try {
      // Construir la ruta de la carpeta
      const folderPath = this.buildFolderPath(
        folderType,
        userId,
        postId,
        forumId
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);
      formData.append("folder", folderPath);

      if (resourceType && resourceType !== "auto") {
        formData.append("resource_type", resourceType);
      }

      // Agregar etiquetas para mejor organización
      formData.append(
        "tags",
        `${this.baseFolder},${folderType}${userId ? ",user_" + userId : ""}`
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error subiendo archivo: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      console.log("📁 Cloudinary Upload Success:", {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        resourceType: data.resource_type,
        format: data.format,
        size: data.bytes,
        folder: data.folder,
      });

      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        size: data.bytes,
        width: data.width || null,
        height: data.height || null,
        resourceType: data.resource_type,
        folder: data.folder,
      };
    } catch (error) {
      console.error("Error subiendo a Cloudinary:", error);
      throw error;
    }
  }

  // Construir ruta de carpeta
  buildFolderPath(folderType, userId, postId, forumId) {
    let path = `${this.baseFolder}/${folderType}`;

    switch (folderType) {
      case "licenses":
        return `${path}/${userId}`;

      case "avatars":
        return `${path}/${userId}`;

      case "posts":
        if (postId) {
          return `${path}/${postId}`;
        }
        return `${path}/temp`;

      case "forums":
        if (forumId) {
          return `${path}/${forumId}`;
        }
        return `${path}/temp`;

      case "temp":
        if (userId) {
          return `${path}/${userId}`;
        }
        return path;

      default:
        return path;
    }
  }

  // Métodos específicos para cada tipo de archivo
  async uploadLicense(userId, file) {
    return this.uploadFile(file, {
      folderType: "licenses",
      userId: userId,
      resourceType: "auto",
    });
  }

  async uploadAvatar(userId, file) {
    return this.uploadFile(file, {
      folderType: "avatars",
      userId: userId,
      resourceType: "image",
    });
  }

  async uploadPostImage(postId, file) {
    return this.uploadFile(file, {
      folderType: "posts",
      postId: postId,
      resourceType: "image",
    });
  }

  async uploadPostDocument(postId, file) {
    return this.uploadFile(file, {
      folderType: "posts",
      postId: postId,
      resourceType: "raw", // Para PDFs, documentos
    });
  }

  async uploadForumBanner(forumId, file) {
    return this.uploadFile(file, {
      folderType: "forums",
      forumId: forumId,
      resourceType: "image",
    });
  }

  // Determinar el tipo de recurso basado en el archivo
  getResourceType(file) {
    const type = file.type || "";
    const name = file.name || "";

    if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
      return "auto"; // ✅ Usar "auto" para PDFs
    }

    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("application/") || type.startsWith("text/"))
      return "auto";

    return "auto";
  }

  // Generar URLs optimizadas
  getOptimizedUrl(publicId, options = {}) {
    const {
      width = null,
      height = null,
      quality = "auto",
      format = "auto",
    } = options;

    let transformations = "";

    if (width || height) {
      transformations += `w_${width || "auto"},h_${height || "auto"},c_fill/`;
    }

    transformations += `q_${quality},f_${format}`;

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  // Eliminar archivo (opcional - para moderación)
  async deleteFile(publicId, resourceType = "image") {
    try {
      // Nota: Para esto necesitarías un backend por seguridad
      console.log("Eliminar archivo:", publicId);
      // Implementar con backend si es necesario
    } catch (error) {
      console.error("Error eliminando archivo:", error);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
