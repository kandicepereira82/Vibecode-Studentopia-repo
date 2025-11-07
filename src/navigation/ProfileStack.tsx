import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CalendarConnectionsScreen from "../screens/CalendarConnectionsScreen";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  CalendarConnections: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="CalendarConnections" component={CalendarConnectionsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
