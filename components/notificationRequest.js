import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export async function registerForPushNotificationsAsync() {
  // Ensure the app is running on a physical device
  if (Device.isDevice) {
    // Check current permission status
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permissions aren't granted, request them
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permissions are still not granted, show an alert
    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Failed to get push notification permissions denied Please go to setting and allow notification"
      );
      return;
    }

    //console.log("Push notification permissions granted!");
  } else {
    Alert.alert(
      "Device Required",
      "Must use a physical device for push notifications."
    );
  }
}
