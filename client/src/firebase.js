// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "moory-social.firebaseapp.com",
  projectId: "moory-social",
  storageBucket: "moory-social.appspot.com",
  messagingSenderId: "86664160808",
  appId: "1:86664160808:web:0b292b497aa0447f3d771d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);