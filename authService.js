// authService.js
import { auth } from './firebaseconfig';
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification} from 'firebase/auth';

const db = getFirestore(); // initialize Firestore

// Sign Up
export const signUpWithEmail = async (email, password, name, phone) => {
  if (!email || !password || !name || !phone) {
    throw new Error("All fields are required.");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });
  await sendEmailVerification(user);

  await setDoc(doc(getFirestore(), "users", user.uid), {
    name,
    email,
    phone,
    createdAt: serverTimestamp(),
    emergencyContacts: []
  });

  return user;
};
  
  // Send Email Verification
  export const sendVerificationEmail = async (user) => {
    try {
      if (user) {
        await sendEmailVerification(user); // Send verification email
        return 'Verification email sent successfully!';
      } else {
        throw new Error('User object is undefined');
      }
    } catch (error) {
      throw error; // Pass the error to the UI
    }
  };
  
  // Update User Profile (e.g., Name)
  export const updateUserProfile = async (name) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
    } catch (error) {
      throw error;
    }
  };

// Forgot Password Function
export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return 'Password reset email sent successfully!';
    } catch (error) {
      throw error; // Pass the error to the UI for display
    }
  };

// Log In
export const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('Please verify your email before logging in.');
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

//const db = getFirestore();

// Save Additional User Data to Firestore
export const saveUserToFirestore = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), data); // Save to 'users' collection
  } catch (error) {
    throw error;
  }
};

// Log Out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};