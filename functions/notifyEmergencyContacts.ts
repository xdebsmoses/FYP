import { auth } from "../firebaseconfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firestore = getFirestore();

export const notifyEmergencyContacts = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(getFirestore(), "users", user.uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.data();

    const contacts = data?.emergencyContacts || [];
    const senderName = data?.name || "Your friend";

    for (const contact of contacts) {
      const message = `🚨 Hi ${contact.name}, ${senderName} may be in danger and said a trigger word!`;

      await fetch("http://172.20.10.2:3000/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: [contact],
          message,
        }),
      });
    }
  } catch (error) {
    console.error("Error sending emergency alerts:", error);
  }
};