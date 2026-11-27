
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDXpdI9pTY1cNzdcv12Im5GAvca0ipaGJc',
  authDomain: 'parcentoff.firebaseapp.com',
  projectId: 'parcentoff',
  storageBucket: 'parcentoff.firebasestorage.app',
  messagingSenderId: '976775214323',
  appId: '1:976775214323:web:47eb8f2729637cc8edb386',
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);
