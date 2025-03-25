import { auth } from "../firebaseconfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firestore = getFirestore();

export const notifyEmergencyContacts = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const contacts = data?.emergencyContacts || [];
  if (contacts.length === 0) return;

  await fetch("http://10.76.71.143:3000/send-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contacts,
      message: `🚨 ${user.displayName || "Your contact"} may be in danger, they have said a trigger word.`,
    }),
  });
};