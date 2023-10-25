import firebase from 'firebase/compat/app';
import "firebase/compat/auth";

// // Initialize Firebase
// const firebaseConfig = {
//   // TODO: Replace with your Firebase project configuration
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAj0pMzOPCvbbL6uXaAtHmisJvLtGDOQgs",
  authDomain: "manga-reader-6e26c.firebaseapp.com",
  projectId: "manga-reader-6e26c",
  storageBucket: "manga-reader-6e26c.appspot.com",
  messagingSenderId: "123741114523",
  appId: "1:123741114523:web:d09efbe2f2a98e2de4b63e",
  measurementId: "G-28RB8VJQFZ"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
