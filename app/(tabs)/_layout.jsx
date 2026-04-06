import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
    headerShown: false,
    tabBarStyle: {
      position: "absolute",
      backgroundColor: "transparent",  
      borderTopWidth: 0,               
      elevation: 0,                   
      shadowOpacity: 0,              
    },
  }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="myCircle" options={{ title: "Contacts" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}