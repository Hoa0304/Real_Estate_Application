import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAyJQ160esqLVwgSL58dtMW1aY1U5t9ifc",
  authDomain: "real-estate-application-2f7d7.firebaseapp.com",
  projectId: "real-estate-application-2f7d7",
  storageBucket: "real-estate-application-2f7d7.firebasestorage.app",
  messagingSenderId: "299630188470",
  appId: "1:299630188470:web:42614dde9fd378743cd317",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
