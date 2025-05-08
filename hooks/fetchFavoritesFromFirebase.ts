import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const useFetchFavorites = (uid: string) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const favoritesRef = collection(db, 'user', uid, 'favorites');
    const q = query(favoritesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          isFavorite: true,
          ...doc.data(),
        }));
        setFavorites(data);
        setLoading(false);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { favorites, loading };
};

export default useFetchFavorites;
