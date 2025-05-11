import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const useFetchRealEstatePosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'real_estate_posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc: DocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching real estate posts:', error);
        setPosts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { posts, loading };
};

export default useFetchRealEstatePosts;
