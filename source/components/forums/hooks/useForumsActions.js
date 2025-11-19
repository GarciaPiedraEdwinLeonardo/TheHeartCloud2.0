import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  increment,
  collection,
  deleteField,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const useForumActions = () => {
  const user = auth.currentUser;

  // Función auxiliar para actualizar estadísticas del usuario
  const updateUserStats = async (userId, action, forumId = null) => {
    try {
      const userRef = doc(db, "users", userId);
      const updates = {};

      switch (action) {
        case "forum_created":
          updates["stats.forumCount"] = increment(1);
          updates["stats.joinedForumsCount"] = increment(1);
          if (forumId) {
            updates["joinedForums"] = arrayUnion(forumId);
          }
          break;
        case "forum_joined":
          updates["stats.joinedForumsCount"] = increment(1);
          if (forumId) {
            updates["joinedForums"] = arrayUnion(forumId);
          }
          break;
        case "forum_left":
          updates["stats.joinedForumsCount"] = increment(-1);
          if (forumId) {
            updates["joinedForums"] = arrayRemove(forumId);
          }
          break;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        console.log(`✅ Estadísticas actualizadas: ${action}`, updates);
      }
    } catch (error) {
      console.error("❌ Error actualizando estadísticas:", error);
      throw error;
    }
  };

  // Crear nueva comunidad
  const createForum = async (forumData) => {
    try {
      if (!user)
        throw new Error("Debes iniciar sesión para crear una comunidad");

      const forumRef = doc(collection(db, "forums"));
      const forumId = forumRef.id;

      const newForum = {
        id: forumId,
        name: forumData.name,
        description: forumData.description,
        rules:
          forumData.rules ||
          "• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        membershipSettings: {
          requiresApproval: forumData.requiresApproval || false
        },
        members: [user.uid],
        memberCount: 1,
        pendingMembers: {},
        status: "active",
        disabledAt: null,
        disabledBy: null,
        disabledReason: null,
        moderators: {
          [user.uid]: {
            addedAt: serverTimestamp(),
            addedBy: user.uid,
          },
        },
        postCount: 0,
        lastPostAt: null,
        isDeleted: false,
        deletedAt: null,
      };

      await setDoc(forumRef, newForum);

      // Actualizar estadísticas del usuario
      await updateUserStats(user.uid, "forum_created", forumId);

      return { success: true, forumId, forum: newForum };
    } catch (error) {
      console.error("Error creando comunidad:", error);
      return { success: false, error: error.message };
    }
  };

  // Unirse a comunidad 
  const joinForum = async (forumId) => {
    try {
      if (!user)
        throw new Error("Debes iniciar sesión para unirte a una comunidad");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar que no sea ya miembro
      if (forumData.members && forumData.members.includes(user.uid)) {
        throw new Error("Ya eres miembro de esta comunidad");
      }

      // Verificar que no tenga solicitud pendiente
      if (forumData.pendingMembers && forumData.pendingMembers[user.uid]) {
        throw new Error("Ya tienes una solicitud pendiente");
      }

      // Obtener datos del usuario
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // Si requiere aprobación, agregar a pendientes
      if (forumData.membershipSettings?.requiresApproval) {
        await updateDoc(forumRef, {
          [`pendingMembers.${user.uid}`]: {
            requestedAt: serverTimestamp(),
            userEmail: userData?.email || "Email no disponible",
            userName: userData?.name ? 
              `${userData.name.name || ''} ${userData.name.apellidopat || ''} ${userData.name.apellidomat || ''}`.trim() 
              : 'Usuario',
            userRole: userData?.role || 'unverified'
          }
        });

        return { 
          success: true, 
          requiresApproval: true,
          message: "Solicitud enviada. Espera la aprobación de un moderador."
        };
      } else {
        // Entrada libre - unirse directamente
        await updateDoc(forumRef, {
          members: arrayUnion(user.uid),
          memberCount: increment(1),
        });

        // Actualizar estadísticas del usuario
        await updateUserStats(user.uid, "forum_joined", forumId);

        return { success: true, requiresApproval: false };
      }
    } catch (error) {
      console.error("Error uniéndose a comunidad:", error);
      return { success: false, error: error.message };
    }
  };

  const approveMember = async (forumId, userId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar permisos (dueño o moderador)
      const isOwner = forumData.ownerId === user.uid;
      const isModerator = forumData.moderators && forumData.moderators[user.uid];
      
      if (!isOwner && !isModerator) {
        throw new Error("Solo dueños y moderadores pueden aprobar miembros");
      }

      // Verificar que existe solicitud pendiente
      if (!forumData.pendingMembers || !forumData.pendingMembers[userId]) {
        throw new Error("No hay solicitud pendiente para este usuario");
      }

      // Usar batch para operación atómica
      const batch = writeBatch(db);

      // 1. Agregar a miembros
      batch.update(forumRef, {
        members: arrayUnion(userId),
        memberCount: increment(1),
      });

      // 2. Remover de pendientes
      batch.update(forumRef, {
        [`pendingMembers.${userId}`]: deleteField()
      });

      await batch.commit();

      // Actualizar estadísticas del usuario aprobado
      await updateUserStats(userId, "forum_joined", forumId);

      return { success: true };
    } catch (error) {
      console.error("Error aprobando miembro:", error);
      return { success: false, error: error.message };
    }
  };

  const rejectMember = async (forumId, userId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar permisos (dueño o moderador)
      const isOwner = forumData.ownerId === user.uid;
      const isModerator = forumData.moderators && forumData.moderators[user.uid];
      
      if (!isOwner && !isModerator) {
        throw new Error("Solo dueños y moderadores pueden rechazar miembros");
      }

      // Remover de pendientes
      await updateDoc(forumRef, {
        [`pendingMembers.${userId}`]: deleteField()
      });

      return { success: true };
    } catch (error) {
      console.error("Error rechazando miembro:", error);
      return { success: false, error: error.message };
    }
  };

  const updateMembershipSettings = async (forumId, requiresApproval) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Solo el dueño puede cambiar esta configuración
      if (forumData.ownerId !== user.uid) {
        throw new Error("Solo el dueño puede cambiar la configuración de membresía");
      }

      await updateDoc(forumRef, {
        "membershipSettings.requiresApproval": requiresApproval
      });

      return { success: true };
    } catch (error) {
      console.error("Error actualizando configuración:", error);
      return { success: false, error: error.message };
    }
  };

  // Abandonar comunidad
  const leaveForum = async (forumId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar que es miembro
      if (!forumData.members || !forumData.members.includes(user.uid)) {
        throw new Error("No eres miembro de esta comunidad");
      }

      // No permitir que el dueño abandone su propia comunidad
      if (forumData.ownerId === user.uid) {
        throw new Error("El dueño no puede abandonar la comunidad");
      }

      // Actualizar el foro
      await updateDoc(forumRef, {
        members: arrayRemove(user.uid),
        memberCount: increment(-1),
      });

      // Actualizar estadísticas del usuario
      await updateUserStats(user.uid, "forum_left", forumId);

      return { success: true };
    } catch (error) {
      console.error("Error abandonando comunidad:", error);
      return { success: false, error: error.message };
    }
  };

  // Agregar moderador
  const addModerator = async (forumId, targetUserId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar que el usuario es el dueño
      if (forumData.ownerId !== user.uid) {
        throw new Error("Solo el dueño puede agregar moderadores");
      }

      // Verificar que el usuario objetivo es miembro
      if (!forumData.members || !forumData.members.includes(targetUserId)) {
        throw new Error("El usuario debe ser miembro de la comunidad");
      }

      await updateDoc(forumRef, {
        [`moderators.${targetUserId}`]: {
          addedAt: serverTimestamp(),
          addedBy: user.uid,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error agregando moderador:", error);
      return { success: false, error: error.message };
    }
  };

  // Remover moderador
  const removeModerator = async (forumId, targetUserId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      // Verificar que el usuario es el dueño
      if (forumData.ownerId !== user.uid) {
        throw new Error("Solo el dueño puede remover moderadores");
      }

      await updateDoc(forumRef, {
        [`moderators.${targetUserId}`]: deleteField(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error removiendo moderador:", error);
      return { success: false, error: error.message };
    }
  };

  // Verificar si usuario es miembro y su rol
  const checkUserMembership = async (forumId) => {
    try {
      if (!user) return { isMember: false, role: null };

      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) return { isMember: false, role: null };

      const forumData = forumDoc.data();

      // Verificar si es miembro
      const isMember = forumData.members?.includes(user.uid) || false;

      // Determinar rol
      let role = "member";
      if (forumData.ownerId === user.uid) {
        role = "owner";
      } else if (forumData.moderators && forumData.moderators[user.uid]) {
        role = "moderator";
      }

      return { isMember, role };
    } catch (error) {
      console.error("Error verificando membresía:", error);
      return { isMember: false, role: null };
    }
  };

  // Obtener datos específicos de una comunidad
  const getForumData = async (forumId) => {
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) throw new Error("Comunidad no encontrada");

      const forumData = forumDoc.data();

      return {
        success: true,
        data: {
          id: forumDoc.id,
          ...forumData,
          // Asegurar valores por defecto
          memberCount: forumData.memberCount || 0,
          postCount: forumData.postCount || 0,
          rules:
            forumData.rules ||
            "• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional",
        },
      };
    } catch (error) {
      console.error("Error obteniendo datos de comunidad:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    createForum,
    joinForum,
    leaveForum,
    addModerator,
    removeModerator,
    checkUserMembership,
    getForumData,
    approveMember,
    rejectMember,
    updateMembershipSettings
  };
};
