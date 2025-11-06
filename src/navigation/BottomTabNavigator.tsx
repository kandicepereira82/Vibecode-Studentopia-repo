import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import TasksScreen from "../screens/TasksScreen";
import CalendarScreen from "../screens/CalendarScreen";
import TimerScreen from "../screens/TimerScreen";
import AIHelperScreen from "../screens/AIHelperScreen";
import StudyTipsScreen from "../screens/StudyTipsScreen";
import GroupsScreen from "../screens/GroupsScreen";
import FriendsScreen from "../screens/FriendsScreen";
import StudyRoomScreen from "../screens/StudyRoomScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MindfulnessScreen from "../screens/MindfulnessScreen";
import useUserStore from "../state/userStore";
import { useTranslation } from "../utils/translations";

export type RootTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Timer: undefined;
  AIHelper: undefined;
  StudyTips: undefined;
  Groups: undefined;
  Friends: undefined;
  StudyRooms: undefined;
  Mindfulness: undefined;
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
      case "galaxy":
        return "#5E35B1";
      case "rainbow":
        return "#FBC02D";
      case "sunset":
        return "#F57C00";
      case "arctic":
        return "#00796B";
      case "golden":
        return "#E64A19";
      case "cherry":
        return "#C2185B";
      default:
        return "#4CAF50";
    }
  };

  // Rainbow colors for each tab: Red, Orange, Yellow, Green, Cyan, Blue, Purple
  const getRainbowTabColor = (tabName: string) => {
    if (user?.themeColor !== "rainbow") return undefined;

    switch (tabName) {
      case "Home":
        return "#FF0000"; // Red
      case "Tasks":
        return "#FF7F00"; // Orange
      case "Calendar":
        return "#D4AF37"; // Darker Gold/Yellow
      case "Timer":
        return "#00B050"; // Green
      case "AIHelper":
        return "#00FFFF"; // Cyan
      case "StudyTips":
        return "#0000FF"; // Blue
      case "Groups":
        return "#9400D3"; // Purple
      case "Friends":
        return "#FF1493"; // Deep Pink
      case "StudyRooms":
        return "#FF69B4"; // Hot Pink
      case "Profile":
        return "#8B008B"; // Dark Magenta (10 tabs)
      default:
        return undefined;
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
            <Ionicons name="home" size={size} color={getRainbowTabColor("Home") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Home") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: t("tasks"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" size={size} color={getRainbowTabColor("Tasks") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Tasks") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: t("calendar"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={getRainbowTabColor("Calendar") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Calendar") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarLabel: t("timer"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={getRainbowTabColor("Timer") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Timer") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="AIHelper"
        component={AIHelperScreen}
        options={{
          tabBarLabel: t("aiHelper"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={getRainbowTabColor("AIHelper") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("AIHelper") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="StudyTips"
        component={StudyTipsScreen}
        options={{
          tabBarLabel: "Tips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={getRainbowTabColor("StudyTips") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("StudyTips") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarLabel: "Groups",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={getRainbowTabColor("Groups") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Groups") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: "Friends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle" size={size} color={getRainbowTabColor("Friends") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Friends") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="StudyRooms"
        component={StudyRoomScreen}
        options={{
          tabBarLabel: "Rooms",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam" size={size} color={getRainbowTabColor("StudyRooms") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("StudyRooms") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Mindfulness"
        component={MindfulnessScreen}
        options={{
          tabBarLabel: "Mindfulness",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={getRainbowTabColor("Mindfulness") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Mindfulness") || undefined,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("profile"),
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="person" size={size} color={getRainbowTabColor("Profile") || color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            color: getRainbowTabColor("Profile") || undefined,
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
