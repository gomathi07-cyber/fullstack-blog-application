// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-898bd.firebaseapp.com",
  projectId: "mern-blog-898bd",
  storageBucket: "mern-blog-898bd.firebasestorage.app",
  messagingSenderId: "61947536267",
  appId: "1:61947536267:web:594d4c7a5bbc1cf145858e",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
