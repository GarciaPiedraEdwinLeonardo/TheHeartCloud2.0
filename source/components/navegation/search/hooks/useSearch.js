import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "./../../../../config/firebase";

export const useSearch = (searchQuery) => {
  const [results, setResults] = useState({ forums: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setResults({ forums: [], users: [] });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Buscar AMBOS tipos simultáneamente
        const [forumsResults, usersResults] = await Promise.all([
          searchForums(searchQuery),
          searchUsers(searchQuery),
        ]);

        setResults({
          forums: forumsResults,
          users: usersResults,
        });
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setError("Error al realizar la búsqueda");
      } finally {
        setLoading(false);
      }
    };

    const searchForums = async (queryText) => {
      try {
        const forumsQuery = query(
          collection(db, "forums"),
          where("isDeleted", "==", false),
          where("status", "==", "active"),
          limit(100)
        );

        const forumsSnapshot = await getDocs(forumsQuery);
        const allForums = forumsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "forum",
          ...doc.data(),
        }));

        // Filtrar por nombre O descripción
        const filteredForums = allForums.filter((forum) => {
          const searchText = queryText.toLowerCase();
          const forumName = forum.name?.toLowerCase() || "";
          const forumDescription = forum.description?.toLowerCase() || "";

          return (
            forumName.includes(searchText) ||
            forumDescription.includes(searchText)
          );
        });

        // Ordenar por relevancia
        return filteredForums.sort((a, b) => {
          const aName = a.name?.toLowerCase() || "";
          const bName = b.name?.toLowerCase() || "";
          const searchText = queryText.toLowerCase();

          const aStartsWith = aName.startsWith(searchText);
          const bStartsWith = bName.startsWith(searchText);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return (b.memberCount || 0) - (a.memberCount || 0);
        });
      } catch (error) {
        console.error("Error buscando forums:", error);
        return [];
      }
    };

    const searchUsers = async (queryText) => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          where("isDeleted", "==", false),
          where("isActive", "==", true),
          limit(50)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const allUsers = usersSnapshot.docs.map((doc) => {
          const userData = doc.data();
          const fullName = `${userData.name?.name || ""} ${
            userData.name?.apellidopat || ""
          } ${userData.name?.apellidomat || ""}`.trim();

          return {
            id: doc.id,
            type: "user",
            ...userData,
            fullName: fullName,
            // Asegurar que tenemos los datos necesarios para mostrar en la lista
            photoURL: userData.photoURL || null,
            role: userData.role || "unverified",
            professionalInfo: userData.professionalInfo || {},
            stats: userData.stats || {},
          };
        });

        // Filtrar usuarios por nombre completo O especialidad
        return allUsers.filter((user) => {
          const searchText = queryText.toLowerCase();
          const userName = user.fullName?.toLowerCase() || "";
          const userSpecialty =
            user.professionalInfo?.specialty?.toLowerCase() || "";

          return (
            userName.includes(searchText) || userSpecialty.includes(searchText)
          );
        });
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        return [];
      }
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(performSearch, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Solo dependemos de searchQuery

  return { results, loading, error };
};
