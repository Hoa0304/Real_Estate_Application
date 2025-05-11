import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Bạn có thể định nghĩa rõ type nếu muốn, ví dụ:
interface FavoriteItem {
  id: string;
  title: string;
  price: string;
  location: string;
  image?: string;
  images?: string[];
  contact: {
    name: string;
    phone?: string;
  };
  isFavorite: boolean;
  [key: string]: any; // cho phép thêm trường phụ nếu có
}

const useFetchFavorites = (uid: string) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = collection(db, 'user', uid, 'favorites');
    const q = query(favoritesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          isFavorite: true,
          ...doc.data(),
        })) as FavoriteItem[];

        setFavorites(data);
        setLoading(false);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        setFavorites([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { favorites, loading };
};

export default useFetchFavorites;
