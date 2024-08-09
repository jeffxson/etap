import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, TextInput, Button } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 6.438912,
    longitude: 3.5618816,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [geofence, setGeofence] = useState({
    latitude: 6.438912,
    longitude: 3.5618816,
    radius: 500,
  });
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      checkGeofence(location);
    }
  }, [location, geofence]);

  const checkGeofence = (currentLocation) => {
    const distance = getDistance(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      { latitude: geofence.latitude, longitude: geofence.longitude }
    );

    if (distance < geofence.radius) {
      triggerNotification("You have entered the area!");
    } else {
      triggerNotification("You have exited the area!");
    }
  };

  const getDistance = (point1, point2) => {
    const rad = (x) => (x * Math.PI) / 180;
    const R = 6378137; // Earth’s mean radius in meters
    const dLat = rad(point2.latitude - point1.latitude);
    const dLong = rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(point1.latitude)) *
        Math.cos(rad(point2.latitude)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // returns the distance in meters
  };

  const triggerNotification = (message) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Geofence Alert",
        body: message,
      },
      trigger: null,
    });
  };

  const updateGeofenceLocation = () => {
    if (!latitude || !longitude) {
      Alert.alert("Please enter valid latitude and longitude.");
      return;
    }

    setGeofence((prev) => ({
      ...prev,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }));

    setRegion((prev) => ({
      ...prev,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setLatitude}
          value={latitude}
          placeholder="Latitude"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={setLongitude}
          value={longitude}
          placeholder="Longitude"
          keyboardType="numeric"
        />
        <Button
          title="Set Geofence Location"
          onPress={updateGeofenceLocation}
        />
      </View>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {location && <Marker coordinate={location} />}
        <Circle
          center={geofence}
          radius={geofence.radius}
          fillColor="rgba(255, 0, 0, 0.3)"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "70%",
  },
  inputContainer: {
    width: "80%",
    marginVertical: 10,
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
});
