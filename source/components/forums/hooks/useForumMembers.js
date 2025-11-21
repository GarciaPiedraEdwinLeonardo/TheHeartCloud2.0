import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./../../../config/firebase";

export const useForumMembers = (forumId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!forumId) return;

    const loadMembers = async () => {
      try {
        setLoading(true);
        const forumRef = doc(db, "forums", forumId);
        const forumDoc = await getDoc(forumRef);

        if (!forumDoc.exists()) {
          throw new Error("Comunidad no encontrada");
        }

        const forumData = forumDoc.data();
        const memberIds = forumData.members || [];
        const moderators = forumData.moderators || {};
        const ownerId = forumData.ownerId;

        const membersData = [];

        for (const memberId of memberIds) {
          try {
            const userDoc = await getDoc(doc(db, "users", memberId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              let role = "member";

              if (memberId === ownerId) {
                role = "owner";
              } else if (moderators[memberId]) {
                role = "moderator";
              }

              membersData.push({
                id: memberId,
                ...userData,
                role,
                joinedAt:
                  forumData.members[memberId]?.joinedAt || forumData.createdAt,
              });
            }
          } catch (userError) {
            console.error(`Error loading user ${memberId}:`, userError);
          }
        }

        setMembers(membersData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [forumId]);

  return { members, loading, error };
};
