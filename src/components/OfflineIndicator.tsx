import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useConnectivityStore from "../state/connectivityStore";
import { getTheme } from "../utils/themes";
import useUserStore from "../state/userStore";

interface OfflineIndicatorProps {
  position?: "top" | "bottom";
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ position = "top" }) => {
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const isSyncing = useConnectivityStore((s) => s.isSyncing);
  const pendingActions = useConnectivityStore((s) => s.pendingActions);
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);

  // Don't show anything when online and no pending actions
  if (isOnline && !isSyncing && pendingActions === 0) {
    return null;
  }

  if (isOnline && isSyncing) {
    return (
      <View
        style={{
          backgroundColor: theme.primary + "20",
          borderBottomWidth: 1,
          borderBottomColor: theme.primary + "40",
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="sync" size={16} color={theme.primary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.primary }}>
          Syncing changes...
        </Text>
      </View>
    );
  }

  if (isOnline && pendingActions > 0) {
    return (
      <View
        style={{
          backgroundColor: theme.secondary + "20",
          borderBottomWidth: 1,
          borderBottomColor: theme.secondary + "40",
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark-circle" size={16} color={theme.secondary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.secondary }}>
          {pendingActions} change{pendingActions === 1 ? "" : "s"} synced
        </Text>
      </View>
    );
  }

  // Offline mode
  return (
    <View
      style={{
        backgroundColor: "#FF6B6B20",
        borderBottomWidth: 1,
        borderBottomColor: "#FF6B6B40",
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="wifi-outline" size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
      <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#FF6B6B" }}>
        Offline Mode • Changes will sync when online
      </Text>
    </View>
  );
};

export default OfflineIndicator;
