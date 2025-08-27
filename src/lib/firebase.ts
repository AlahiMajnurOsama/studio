import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "chromashop-f88nq",
  appId: "1:725680619675:web:9a9de9b8f29ddb8cff063e",
  storageBucket: "chromashop-f88nq.appspot.com",
  apiKey: "AIzaSyA88NaKH9xnxElZcv2O1-QSpAkx1kfKQG0",
  authDomain: "chromashop-f88nq.firebaseapp.com",
  messagingSenderId: "725680619675"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
