import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVgS0hXjkkk4LZzE_EVWB806Ocs_LFZgw",
  authDomain: "eyeballs-e0ccf.firebaseapp.com",
  projectId: "eyeballs-e0ccf",
  storageBucket: "eyeballs-e0ccf.firebasestorage.app",
  messagingSenderId: "1054144312345",
  appId: "1:1054144312345:web:10b677bd2bff6b4ed5a688",
  measurementId: "G-TLZVBV8QVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);