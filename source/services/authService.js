import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import cloudinaryConfig from '../config/cloudinary';

export class AuthService {
  // Registro de usuario
  static async registerUser(userData, cedulaFile) {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

      // 2. Subir cédula profesional a Cloudinary
      let licenseUploadResult = null;
      if (cedulaFile) {
        licenseUploadResult = await this.uploadLicenseFile(cedulaFile, user.uid);
      }

      // 3. Crear documento del usuario en Firestore
      const userDoc = {
        id: user.uid,
        email: userData.email,
        username: this.generateUsername(userData.nombres, userData.apellidoPaterno),
        name: {
          apellidopat: userData.apellidoPaterno,
          apellidomat: userData.apellidoMaterno,
          name: userData.nombres
        },
        role: "unverified",
        
        profileMedia: {
          avatarUrl: "",
          avatarStoragePath: "",
          bannerUrl: "",
          bannerStoragePath: "",
          lastUpdated: serverTimestamp()
        },
        
        professionalInfo: {
          specialty: userData.especialidadMedica,
          licenseNumber: userData.cedulaProfesional,
          licenseCountry: userData.paisEmision,
          university: userData.institucion,
          licenseDocument: licenseUploadResult?.url || "",
          titulationYear: parseInt(userData.anioTitulacion),
          verificationStatus: "pending",
          verifiedAt: null,
          verifiedBy: null
        },
        
        stats: {
          aura: 0,
          contributionCount: 0,
          postCount: 0,
          commentCount: 0,
          forumCount: 0,
          joinedForumsCount: 0,
          totalImagesUploaded: 0,
          totalStorageUsed: 0
        },
        
        suspension: {
          isSuspended: false,
          reason: null,
          startDate: null,
          endDate: null,
          suspendedBy: null
        },
        
        joinedForums: [],
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        isDeleted: false,
        deletedAt: null
      };

      // 4. Guardar en Firestore
      await setDoc(doc(db, 'users', user.uid), userDoc);

      // 5. Actualizar perfil en Auth
      await updateProfile(user, {
        displayName: `${userData.nombres} ${userData.apellidoPaterno}`
      });

      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('Error en registro:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Subir cédula a Cloudinary - CORREGIDO
  static async uploadLicenseFile(file, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPresets.licenses);
    formData.append('folder', `theheartcloud/licenses/${userId}`);

    formData.append('resource_type', 'raw');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(`Error al subir la cédula: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes
      };
    } catch (error) {
      console.error('Error subiendo cédula:', error);
      throw error;
    }
  }

  // Generar username automático
  static generateUsername(nombres, apellidoPaterno) {
    const firstName = nombres.split(' ')[0].toLowerCase();
    const lastname = apellidoPaterno.toLowerCase();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${firstName}.${lastname}${randomNum}`;
  }

  // Iniciar sesión
  static async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Actualizar lastLogin en Firestore
      await this.updateUserLastLogin(userCredential.user.uid);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Recuperar contraseña
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Cerrar sesión
  static async logoutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Actualizar último login
  static async updateUserLastLogin(userId) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }

  // Manejo de errores
  static getAuthErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
      'auth/invalid-email': 'El correo electrónico no es válido.',
      'auth/operation-not-allowed': 'La operación no está permitida.',
      'auth/weak-password': 'La contraseña es demasiado débil.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
      'auth/user-not-found': 'No existe una cuenta con este correo.',
      'auth/wrong-password': 'La contraseña es incorrecta.',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.'
    };
    
    return errorMessages[errorCode] || 'Ocurrió un error inesperado.';
  }
}