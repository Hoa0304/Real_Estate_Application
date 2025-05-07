import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

export const fetchFavoritesFromFirebase = async () => {
  const user = getAuth().currentUser;
  if (!user) return [];

  const favCol = collection(db, 'user', user.uid, 'favorites');
  const snapshot = await getDocs(favCol);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      image: data.image || '',
      title: data.title || '',
      price: data.price || '',
      location: data.location || '',
    };
  });
};
