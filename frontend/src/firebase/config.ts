import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your own keys!
const firebaseConfig = {
  apiKey: "AIzaSyAf0NlkWdN_DYYW0kTOugZVyYzEkmQnqOA",
  authDomain: "impulse-ai-e64fb.firebaseapp.com",
  projectId: "impulse-ai-e64fb",
  storageBucket: "impulse-ai-e64fb.firebasestorage.app",
  messagingSenderId: "776366890432",
  appId: "1:776366890432:web:d4425052662f90dc823c25",
  measurementId: "G-MX5B6VPK4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
