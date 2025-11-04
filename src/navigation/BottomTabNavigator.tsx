import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import TasksScreen from "../screens/TasksScreen";
import CalendarScreen from "../screens/CalendarScreen";
import TimerScreen from "../screens/TimerScreen";
import AIHelperScreen from "../screens/AIHelperScreen";
import ProfileScreen from "../screens/ProfileScreen";
import useUserStore from "../state/userStore";
import { useTranslation } from "../utils/translations";

export type RootTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Timer: undefined;
  AIHelper: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTabNavigator = () => {
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation(user?.language || "en");

  const getThemeColor = () => {
    switch (user?.themeColor) {
      case "nature":
        return "#4CAF50";
      case "ocean":
        return "#0288D1";
      case "sunset":
        return "#FF6F00";
      case "galaxy":
        return "#5E35B1";
      case "rainbow":
        return "#FBC02D";
      case "forest":
        return "#2E7D32";
      case "desert":
        return "#F57C00";
      case "arctic":
        return "#00796B";
      case "autumn":
        return "#E64A19";
      case "cherry":
        return "#C2185B";
      default:
        return "#4CAF50";
    }
  };

  const themeColor = getThemeColor();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColor,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: t("tasks"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: t("calendar"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarLabel: t("timer"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIHelper"
        component={AIHelperScreen}
        options={{
          tabBarLabel: t("aiHelper"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
