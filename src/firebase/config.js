import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxvsbXEYU9ngxoEPRwsVs4vygOz8QSaVQ",
  authDomain: "tailor-shop-newdelhi.firebaseapp.com",
  databaseURL:
    "https://tailor-shop-newdelhi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tailor-shop-newdelhi",
  storageBucket: "tailor-shop-newdelhi.firebasestorage.app",
  messagingSenderId: "356112704491",
  appId: "1:356112704491:web:8354580694a2ffe0beefae",
  measurementId: "G-RGCDC89NWN",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);