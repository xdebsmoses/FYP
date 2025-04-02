import * as Location from 'expo-location';
import { auth } from '../firebaseconfig'; // Adjust the path to your Firebase config
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firestore = getFirestore();

const getUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("Location permission denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords; // { latitude, longitude }
  } catch (error) {
    console.error("Error getting location: ", error);
    return null;
  }
};

export const notifyEmergencyContacts = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const contacts = data?.emergencyContacts || [];
  if (contacts.length === 0) return;

  // Get the user's location
  const location = await getUserLocation();
  if (!location) return;

  const { latitude, longitude } = location;

  // Include location in the message
  const locationMessage = `They are currently at latitude: ${latitude.toFixed(4)}, longitude: ${longitude.toFixed(4)}.`;

  await fetch("http://10.76.71.143:3000/send-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contacts,
      message: `🚨 ${user.displayName || "Your contact"} may be in danger, they have said a trigger word. ${locationMessage}`,
    }),
  });
};