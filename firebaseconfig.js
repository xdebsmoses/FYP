// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL41UUfB5U6zHuWpXPnn151SD7t5uB5fA",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "care-e6c23",
  databaseURL: "https://care-e6c23-default-rtdb.firebaseio.com",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export authentication
export const auth = getAuth(app);
export const database = getDatabase(app); 
export const firestore = getFirestore(app); 