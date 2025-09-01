// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQhYOmxDTUOuIw176x2y2kFCWW8Uq9070",
    authDomain: "car-platform-2f01f.firebaseapp.com",
    projectId: "car-platform-2f01f",
    storageBucket: "car-platform-2f01f.firebasestorage.app",
    messagingSenderId: "567966970483",
    appId: "1:567966970483:web:1f1df36db2b419718db006"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();