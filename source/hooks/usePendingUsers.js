import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const usePendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuarios pendientes de verificación
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'users'),
        where('professionalInfo.verificationStatus', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      setPendingUsers(users);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Error al cargar solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  // Aprobar usuario
  const approveUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'professionalInfo.verificationStatus': 'verified',
        'professionalInfo.verifiedAt': new Date(),
        'professionalInfo.verifiedBy': 'admin', // Aquí pondrías el ID del admin real
        'role': 'doctor'
      });
      
      // Actualizar lista local
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      return { success: true };
    } catch (error) {
      console.error('Error approving user:', error);
      return { success: false, error: error.message };
    }
  };

  // Rechazar usuario
  const rejectUser = async (userId, reason = '') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'professionalInfo.verificationStatus': 'rejected',
        'professionalInfo.verifiedAt': new Date(),
        'professionalInfo.verifiedBy': 'admin',
        'professionalInfo.rejectionReason': reason
      });
      
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      return { success: true };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return {
    pendingUsers,
    loading,
    error,
    fetchPendingUsers,
    approveUser,
    rejectUser
  };
};