import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const toggleFavoriteInFirebase = async (item: any, isFavorite: boolean, userId: string) => {
  if (!userId) {
    alert('Bạn cần đăng nhập để lưu yêu thích');
    return;
  }

  const favRef = doc(db, 'user', userId, 'favorites', item.id);

  if (isFavorite) {
    await deleteDoc(favRef);
  } else {
    await setDoc(favRef, item);
  }
};
