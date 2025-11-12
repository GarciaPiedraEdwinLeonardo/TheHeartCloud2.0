// src/services/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "./firebase";
import { cloudinaryService } from "./cloudinary";

export const authService = {
  // Registro de usuario
  async registerUser(userData, cedulaFile) {
    try {
      console.log("Iniciando registro...", userData.email);

      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;
      console.log("Usuario auth creado:", user.uid);

      // 2. Subir cédula profesional a Cloudinary
      let cedulaUrl = "";
      let cloudinaryData = null;

      if (cedulaFile) {
        try {
          console.log("Subiendo cedula a Cloudinary...");
          cloudinaryData = await cloudinaryService.uploadLicense(
            user.uid,
            cedulaFile
          );
          cedulaUrl = cloudinaryData.url;
          console.log("Cedula subida a Cloudinary:", cedulaUrl);
        } catch (uploadError) {
          console.error("Error subiendo a Cloudinary:", uploadError);
          throw new Error(
            "No se pudo subir la cedula. Por favor intente nuevamente"
          );
        }
      }

      // 3. Generar username unico

      const username = this.generateUsername(
        userData.nombres,
        userData.apellidoPaterno
      );
      console.log("Username generado:", username);

      //4. Crear documento del usuario en Firestore
      const userDoc = {
        id: user.uid,
        email: userData.email,
        username: username,
        name: {
          apellidopat: userData.apellidoPaterno,
          apellidomat: userData.apellidoMaterno,
          name: userData.nombres,
        },
        role: "unverified", // Inicia como no verificado

        profileMedia: {
          avatarUrl: "",
          avatarStoragePath: "",
          bannerUrl: "",
          bannerStoragePath: "",
          lastUpdated: serverTimestamp(),
        },

        professionalInfo: {
          specialty: userData.especialidadMedica,
          licenseNumber: userData.cedulaProfesional,
          licenseCountry: userData.paisEmision,
          university: userData.institucion,
          licenseDocument: cedulaUrl,
          titulationYear: parseInt(userData.anioTitulacion),
          verificationStatus: "pending",
          verifiedAt: null,
          verifiedBy: null,
        },

        stats: {
          aura: 0,
          contributionCount: 0,
          postCount: 0,
          commentCount: 0,
          forumCount: 0,
          joinedForumsCount: 0,
          totalImagesUploaded: 0,
          totalStorageUsed: 0,
        },

        suspension: {
          isSuspended: false,
          reason: null,
          startDate: null,
          endDate: null,
          suspendedBy: null,
        },

        joinedForums: [],
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      };

      console.log("Guardando en Firestore..." + userDoc);

      // Guardar en Firestore
      await setDoc(doc(db, "users", user.uid), userDoc);
      console.log("Usuario guardado en Firestore");

      // 5. Actualizar el perfil en Authentication
      await updateProfile(user, {
        displayName: `${userData.nombres} ${userData.apellidoPaterno}`,
      });

      return { success: true, user, cloudinaryUpload: !!cloudinaryData };
    } catch (error) {
      console.error("Error en registro:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  },

  // Inicio de sesión
  async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Actualizar último login
      await this.updateLastLogin(userCredential.user.uid);

      return { success: true, user: userCredential.user };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  },

  // Recuperar contraseña
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  },

  // Cerrar sesión
  async logoutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  },

  // Helper para generar username único
  generateUsername(nombres, apellidoPaterno) {
    const firstName = nombres.toLowerCase().split(" ")[0];
    const lastName = apellidoPaterno.toLowerCase();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${firstName}.${lastName}${randomNum}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  },

  // Helper para actualizar último login
  async updateLastLogin(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error actualizando último login:", error);
    }
  },

  // Traducción de errores de Firebase
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use":
        "Este correo electrónico ya está registrado.",
      "auth/invalid-email": "El correo electrónico no es válido.",
      "auth/operation-not-allowed": "La operación no está permitida.",
      "auth/weak-password": "La contraseña es demasiado débil.",
      "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
      "auth/user-not-found": "No existe una cuenta con este correo.",
      "auth/wrong-password": "La contraseña es incorrecta.",
      "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
      "permission-denied": "Error de permisos en la base de datos.",
    };

    return errorMessages[errorCode] || "Ocurrió un error inesperado.";
  },
};
