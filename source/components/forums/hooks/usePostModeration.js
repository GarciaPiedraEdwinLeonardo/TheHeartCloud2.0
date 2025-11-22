import { useState } from 'react';
import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  arrayRemove, 
  increment,
  deleteDoc,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { notificationService } from './../../notifications/services/notificationService';

export const usePostModeration = () => {
  const [loading, setLoading] = useState(false);

  const validatePost = async (postId, forumId, forumName) => {
    setLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: 'active',
        validatedAt: new Date(),
        validatedBy: auth.currentUser.uid
      });
      
      // Notificar al autor
      const postDoc = await getDoc(postRef);
      const post = postDoc.data();
      await notificationService.sendPostApproved(post.authorId, forumId, forumName);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const rejectPost = async (postId, forumId, forumName, reason) => {
    setLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Publicación no encontrada');
      }

      const postData = postDoc.data();
      const authorId = postData.authorId;

      const batch = writeBatch(db);

      // 1. Eliminar post completamente
      batch.delete(postRef);

      // 2. Actualizar contador del foro (solo si el post estaba activo)
      if (postData.status === 'active') {
        const forumRef = doc(db, 'forums', forumId);
        batch.update(forumRef, {
          postCount: increment(-1)
        });
      }

      // 3. Actualizar estadísticas del autor
      if (authorId) {
        const authorRef = doc(db, 'users', authorId);
        batch.update(authorRef, {
          'stats.postCount': increment(-1),
          'stats.contributionCount': increment(-1)
        });
      }

      await batch.commit();

      // 4. Notificar al autor
      await notificationService.sendPostRejected(authorId, forumId, forumName, reason);

      // 5. Reportar a moderación global (opcional)
      await reportToGlobalModeration(authorId, reason, 'post_rejected');

      return { success: true };
    } catch (error) {
      console.error('Error rechazando post:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId, reason, forumId) => {
    setLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Publicación no encontrada');
      }

      const postData = postDoc.data();
      const batch = writeBatch(db);

      // 1. Eliminar post completamente
      batch.delete(postRef);

      // 2. Actualizar contador del foro
      const forumRef = doc(db, 'forums', forumId);
      batch.update(forumRef, {
        postCount: increment(-1)
      });

      // 3. Actualizar estadísticas del autor
      if (postData.authorId) {
        const authorRef = doc(db, 'users', postData.authorId);
        batch.update(authorRef, {
          'stats.postCount': increment(-1),
          'stats.contributionCount': increment(-1)
        });
      }

      await batch.commit();

      // 4. Reportar a moderación global
      await reportToGlobalModeration(postData.authorId, reason, 'post_deletion');

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getPendingPosts = async (forumId) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('forumId', '==', forumId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending posts:', error);
      return [];
    }
  };

  const reportToGlobalModeration = async (userId, reason, actionType) => {
    try {
      await addDoc(collection(db, 'moderation_reports'), {
        userId,
        reason,
        moderatorId: auth.currentUser.uid,
        actionType,
        reportedAt: new Date(),
        status: 'pending_review',
        communityContext: true
      });
    } catch (error) {
      console.error('Error reporting to global moderation:', error);
    }
  };

  return {
    validatePost,
    rejectPost,
    deletePost,
    getPendingPosts,
    loading
  };
};