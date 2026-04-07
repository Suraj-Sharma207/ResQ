import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, navigation }) {
  // Use safe area insets to push the floating bar above the iOS home indicator
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.containerWrapper, { paddingBottom: insets.bottom + 15 }]}>
      
      {/*Blur Container  */}
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          let iconName;
          let labelText = route.name;

          // Map route names to icons exactly like the screenshot
          if (route.name.toLowerCase() === "home") {
            iconName = "home";
            labelText = "Home";
          } else if (route.name === "myCircle" || route.name.toLowerCase() === "my circle") {
            iconName = "people"; // Closest to the contact book icon in the image
            labelText = "Contacts";
          } else if (route.name.toLowerCase() === "explore") {
            iconName = "compass";
            labelText = "Explore";
          }else if (route.name.toLowerCase() === "profile") {
            iconName = "person-circle-outline";
            labelText = "Profile";
          }

          // Colors based on your screenshot (Vibrant green for active, dark grey for inactive)
          const color = isFocused ? "#0f56dacc" : "#ff6340";

          return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={color}
              />

              <Text
                style={[
                  styles.label,
                  { color: color, fontWeight: isFocused ? "600" : "500" },
                ]}
              >
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  blurContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    
    width: "90%",
    height: 65,
    borderRadius: 20, // Creates the pill shape
    overflow: "hidden", // Crucial to keep the blur inside the border radius

    // Glass effect
    backgroundColor: "rgba(255,255,255,0.25)",

    // Shadow for the floating look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 0,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    textTransform: "capitalize",
  },
});