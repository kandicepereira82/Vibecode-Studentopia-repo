import React from "react";
import { View } from "react-native";
import ToastComponent, { Toast } from "./Toast";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        pointerEvents: "box-none",
      }}
    >
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

export default ToastContainer;
