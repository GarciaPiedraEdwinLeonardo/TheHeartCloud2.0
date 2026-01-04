import axios from "axios";
import { auth } from "./firebase";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error obteniendo token:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Extraer data automáticamente
    return response.data;
  },
  (error) => {
    // Manejo de errores centralizado
    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error("No autorizado - redirigir a login");
          // window.location.href = '/login';
          break;
        case 403:
          console.error("Prohibido - sin permisos");
          break;
        case 404:
          console.error("Recurso no encontrado");
          break;
        case 500:
          console.error("Error del servidor");
          break;
        default:
          console.error("Error:", data?.error || "Error desconocido");
      }

      return Promise.reject(data?.error || "Error en la petición");
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error("Sin respuesta del servidor");
      return Promise.reject("No se pudo conectar con el servidor");
    } else {
      // Algo pasó al configurar la petición
      console.error("Error:", error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosInstance;
