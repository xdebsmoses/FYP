// SafeRouteMap.tsx (restructured and commented)
import React, { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Linking,
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native";
import axios from "axios"
import { database, firestore } from "../firebaseconfig"
import { ref, onValue } from "firebase/database"
import { collection, getDocs } from "firebase/firestore"

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyAMEtUQMAfYifZOktg_QrGDzuUfbxOBkSs"

// Default fallback location (Nottingham)
const fallbackLocation = { latitude: 52.9545, longitude: -1.1587 }

export default function SafeRouteMap() {
  const [userLocation, setUserLocation] = useState(fallbackLocation) // user's current location
  const [destination, setDestination] = useState("") // destination string
  const [dangerZones, setDangerZones] = useState<any[]>([]) // Firebase and Firestore danger zones
  const [routes, setRoutes] = useState<any[]>([]) // route options from Google Directions API
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null) // selected route index
  const mapRef = useRef<MapView>(null) // reference to the map
  const navigation = useNavigation();

  // On mount: get user location and fetch danger zones
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.")
        return
      }
      const location = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    })()

    // Get danger zones from Realtime DB
    const dbRef = ref(database, "danger_zones")
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          ...data[key],
        }))
        setDangerZones(formatted)
      }
    })

    // Fetch additional reports from Firestore
    const fetchFirestoreReports = async () => {
      const snapshot = await getDocs(collection(firestore, "community_reports"))
      const reports = snapshot.docs.map((doc) => ({
        ...doc.data(),
        severity: doc.data().severity ?? 1,
        description: doc.data().message || "Community report",
      }))
      setDangerZones((prev) => [...prev, ...reports])
    }

    fetchFirestoreReports()
  }, [])

  // Decode polyline returned from Google API
  const decodePolyline = (encoded: string) => {
    let index = 0, lat = 0, lng = 0, coordinates = []
    const factor = 1e5
    while (index < encoded.length) {
      let result = 0, shift = 0, b
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat
      result = shift = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng
      coordinates.push({ latitude: lat / factor, longitude: lng / factor })
    }
    return coordinates
  }

  // Compute risk score based on proximity to danger zones
  const calculateRiskScore = (coords: any[]) => {
    let score = 0
    const threshold = 100
    for (const zone of dangerZones) {
      for (const point of coords) {
        const dx = point.latitude - zone.latitude
        const dy = point.longitude - zone.longitude
        const d = Math.sqrt(dx * dx + dy * dy) * 111000
        if (d < threshold) {
          score += zone.severity
          break
        }
      }
    }
    return score
  }

  // Format duration in human readable format
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const hr = Math.floor(min / 60)
    return hr ? `${hr} hr ${min % 60} min` : `${min} mins`
  }

  // Fetch directions from Google API
  const handleSearch = async () => {
    if (!destination) return
    const origin = `${userLocation.latitude},${userLocation.longitude}`
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`
    try {
      const { data } = await axios.get(url)
      const colors = ["blue", "green", "orange", "purple", "red"]
      const paths = data.routes.map((route: any, index: number) => {
        const coords = decodePolyline(route.overview_polyline.points)
        return {
          coordinates: coords,
          riskScore: calculateRiskScore(coords),
          color: colors[index % colors.length],
          duration: formatDuration(route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0)),
        }
      })
      setRoutes(paths)
      setSelectedRouteIndex(0)
      mapRef.current?.fitToCoordinates(paths[0].coordinates, {
        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
        animated: true,
      })
    } catch {
      Alert.alert("Error", "Failed to fetch route.")
    }
  }

  // Open the selected route in native maps app
  const openInMaps = () => {
    if (!userLocation || selectedRouteIndex === null) return
    const dest = routes[selectedRouteIndex].coordinates.at(-1)
    const link =
      Platform.OS === "ios"
        ? `maps://?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${dest.latitude},${dest.longitude}`
        : `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${dest.latitude},${dest.longitude}`
    Linking.openURL(link)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIcon}>
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: "#fff" }]}>
          Safety <Text style={{ color: "#00FFFF" }}>Group Chats</Text>
        </Text>
        <View style={{ width: 26 }} /> {/* Placeholder for symmetry */}
      </View>
      {/* Map with markers and polylines */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="You are here" pinColor="#00FFFF" />
        )}

        {/* Danger zones */}
        {dangerZones.map((z, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: z.latitude, longitude: z.longitude }}
            pinColor={z.severity >= 4 ? "red" : "orange"}
            title={`Severity ${z.severity}`}
            description={z.description}
          />
        ))}

        {/* Routes */}
        {routes.map((r, i) => (
          <Polyline
            key={i}
            coordinates={r.coordinates}
            strokeColor={r.color}
            strokeWidth={selectedRouteIndex === i ? 6 : 3}
          />
        ))}
      </MapView>

      {/* Search input */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Enter destination..."
          placeholderTextColor="#aaa"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Route Cards */}
      {routes.length > 0 && (
        <ScrollView horizontal style={styles.routeList} contentContainerStyle={{ padding: 10 }}>
          {routes.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.routeCard, selectedRouteIndex === i && styles.selectedCard]}
              onPress={() => setSelectedRouteIndex(i)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <View style={[styles.colorCircle, { backgroundColor: r.color }]} />
                <Text style={styles.cardTitle}>Route {i + 1}</Text>
              </View>
              <Text style={styles.cardText}>Duration: {r.duration}</Text>
              <Text style={styles.cardText}>Risk Score: {r.riskScore}</Text>
              <TouchableOpacity style={styles.navigateBtn} onPress={openInMaps}>
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141E" },
  map: { flex: 1 },
  searchBar: {
    position: "absolute",
    top: 150,
    left: 20,
    right: 20,
    flexDirection: "row",
    backgroundColor: "#19232F",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    color: "#fff",
    backgroundColor: "#0B141E",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Poppins",
    borderColor: "#00FFFF",
    borderWidth: 1,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#00FFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  searchButtonText: {
    color: "#000",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  routeList: {
    position: "absolute",
    bottom: 20,
  },
  routeCard: {
    backgroundColor: "#19232F",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 6,
    width: 180,
    elevation: 4,
    shadowColor: "#000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
  
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#19232F",
    borderBottomWidth: 1,
    borderBottomColor: "#0B141E",
    zIndex: 10,
  },
  
  navIcon: {
    padding: 4,
  },
  
  navTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    color: "#fff",
  },
  
  accent: {
    color: "#00FFFF",
  },
  selectedCard: {
    borderColor: "#00FFFF",
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Poppins",
    marginBottom: 6,
  },
  cardText: {
    color: "#ccc",
    fontSize: 14,
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  navigateBtn: {
    marginTop: 8,
    backgroundColor: "#00FFFF",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00FFFF", // fallback color
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc", // helps visibility
  },
  navigateBtnText: {
    color: "#000",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
})
