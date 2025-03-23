import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { database, firestore } from "../firebaseconfig";
import { ref, onValue } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";

// ------------------ Types ------------------

interface GoogleDirectionsApiResponse {
  status: string;
  routes: {
    overview_polyline: { points: string };
    legs: { duration: { value: number } }[];
  }[];
}

// ------------------ Helper Functions ------------------

function decodePolyline(encoded: string, precision = 5) {
  let index = 0, lat = 0, lng = 0;
  const coordinates: { latitude: number; longitude: number }[] = [];
  let shift = 0, result = 0, byte = 0;
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    coordinates.push({ latitude: lat / factor, longitude: lng / factor });
  }
  return coordinates;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateRiskScore(
  routeCoordinates: { latitude: number; longitude: number }[],
  dangerZones: { latitude: number; longitude: number; severity: number }[]
) {
  let riskScore = 0;
  const threshold = 100;
  for (const zone of dangerZones) {
    for (const point of routeCoordinates) {
      const d = getDistance(point.latitude, point.longitude, zone.latitude, zone.longitude);
      if (d < threshold) {
        riskScore += zone.severity;
        break;
      }
    }
  }
  return riskScore;
}

function secondsToHms(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const hDisplay = h > 0 ? `${h} hr${h > 1 ? "s" : ""} ` : "";
  const mDisplay = m > 0 ? `${m} min${m > 1 ? "s" : ""}` : "";
  return (hDisplay + mDisplay).trim() || "0 mins";
}

function openDirections(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) {
  const lat1 = origin.latitude;
  const lng1 = origin.longitude;
  const lat2 = destination.latitude;
  const lng2 = destination.longitude;

  if (Platform.OS === "ios") {
    const appleMapsUrl = `maps://?saddr=${lat1},${lng1}&daddr=${lat2},${lng2}&dirflg=d`;
    Linking.openURL(appleMapsUrl).catch((err) => {
      console.error("Error opening Apple Maps:", err);
    });
  } else {
    const googleMapsAppUrl = `comgooglemaps://?saddr=${lat1},${lng1}&daddr=${lat2},${lng2}&directionsmode=driving`;
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lng1}&destination=${lat2},${lng2}`;
    Linking.openURL(googleMapsAppUrl).catch(() => {
      Linking.openURL(googleMapsWebUrl);
    });
  }
}

// ------------------ Main Component ------------------

const GOOGLE_MAPS_API_KEY = "AIzaSyAMEtUQMAfYifZOktg_QrGDzuUfbxOBkSs";
const fallbackLocation = { latitude: 52.9545, longitude: -1.1587 };

const SafeRouteMap = () => {
  const [dangerZones, setDangerZones] = useState<
    { latitude: number; longitude: number; severity: number; description: string }[]
  >([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<
    {
      coordinates: { latitude: number; longitude: number }[];
      riskScore: number;
      color: string;
      duration: string;
    }[]
  >([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        setUserLocation(fallbackLocation);
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setUserLocation(fallbackLocation);
      }
    })();
  }, []);

  useEffect(() => {
    const dangerRef = ref(database, "danger_zones");
    onValue(dangerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          latitude: data[key].latitude,
          longitude: data[key].longitude,
          severity: data[key].severity,
          description: data[key].description,
        }));
        setDangerZones(formatted);
      }
    });

    const fetchCommunityReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "community_reports"));
        const reports = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            latitude: data.latitude,
            longitude: data.longitude,
            severity: data.severity ?? 1,
            description: data.message || "Community report",
          };
        });
        setDangerZones((prev) => [...prev, ...reports]);
      } catch (error) {
        console.error("Error fetching community reports:", error);
      }
    };

    fetchCommunityReports();
  }, []);

  const searchRoute = async () => {
    if (!userLocation || !destination) {
      Alert.alert("Missing Info", "Make sure both location and destination are set.");
      return;
    }

    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const dest = encodeURIComponent(destination);
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url) as { data: GoogleDirectionsApiResponse };
      if (response.data.status !== "OK") {
        Alert.alert("Error", `Could not find routes. (${response.data.status})`);
        return;
      }

      const colorArray = ["blue", "green", "orange", "purple", "red", "gray"];
      const computedRoutes = response.data.routes.map((route, index) => {
        const coordinates = decodePolyline(route.overview_polyline.points);
        const riskScore = calculateRiskScore(coordinates, dangerZones);

        let color = colorArray[index % colorArray.length];
        if (riskScore > 10) color = "red";
        else if (riskScore > 5) color = "orange";

        const totalSeconds = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
        const duration = secondsToHms(totalSeconds);

        return { coordinates, riskScore, color, duration };
      });

      setRoutes(computedRoutes);
      setSelectedRouteIndex(null);

      if (computedRoutes.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(computedRoutes[0].coordinates, {
          edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Failed to fetch routes.");
    }
  };

  const handleSelectRoute = (index: number) => {
    setSelectedRouteIndex(index);
    if (mapRef.current && routes[index]) {
      mapRef.current.fitToCoordinates(routes[index].coordinates, {
        edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
        animated: true,
      });
    }
  };

  const handleNavigate = (index: number) => {
    if (!userLocation) return;
    const destinationCoords = routes[index].coordinates.at(-1)!;
    openDirections(userLocation, destinationCoords);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: userLocation?.latitude ?? fallbackLocation.latitude,
          longitude: userLocation?.longitude ?? fallbackLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {dangerZones.map((zone, index) => (
          <Marker
            key={`danger-${index}`}
            coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
            title={`Risk Level: ${zone.severity}`}
            description={zone.description}
            pinColor={zone.severity >= 4 ? "red" : "orange"}
          />
        ))}

        {userLocation && (
          <Marker coordinate={userLocation} title="You are here" pinColor="blue" />
        )}

        {routes.length > 0 && (
          <Marker
            coordinate={
              selectedRouteIndex !== null
                ? routes[selectedRouteIndex].coordinates.at(-1)!
                : routes[0].coordinates.at(-1)!
            }
            title="Destination"
            pinColor="purple"
          />
        )}

        {routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={selectedRouteIndex === index ? 6 : 4}
          />
        ))}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Button title="Search Route" onPress={searchRoute} />
      </View>

      {routes.length > 1 && (
        <View style={styles.routeListContainer}>
          <FlatList
            data={routes}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item, index }) => {
              const isSelected = selectedRouteIndex === index;
              return (
                <View style={[styles.routeItem, isSelected && styles.selectedRouteItem]}>
                  <View style={styles.routeHeader}>
                    <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                    <TouchableOpacity onPress={() => handleSelectRoute(index)}>
                      <Text style={styles.routeTitle}>Route {index + 1}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.routeDetail}>Risk: {item.riskScore}</Text>
                  <Text style={styles.routeDetail}>Duration: {item.duration}</Text>
                  <View style={{ marginTop: 5 }}>
                    <Button title="Navigate" onPress={() => handleNavigate(index)} />
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

export default SafeRouteMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    padding: 10,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
  },
  routeListContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  routeItem: {
    backgroundColor: "#fff",
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    width: 160,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
  },
  selectedRouteItem: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  routeDetail: {
    fontSize: 14,
    marginVertical: 2,
  },
});