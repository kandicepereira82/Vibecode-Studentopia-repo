/**
 * Standardized error handling utilities
 */

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  icon: string;
  severity: "error" | "warning" | "info";
}

/**
 * Parse various error types into standardized format
 */
export const parseError = (error: any): ErrorInfo => {
  // Handle string errors
  if (typeof error === "string") {
    return {
      code: "UNKNOWN",
      message: error,
      userMessage: error,
      icon: "⚠️",
      severity: "error",
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("api") ||
      message.includes("401") ||
      message.includes("403")
    ) {
      return {
        code: "API_ERROR",
        message: error.message,
        userMessage: "⚠️ API Error: Unable to connect to the service",
        icon: "⚠️",
        severity: "error",
      };
    }

    if (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("econnrefused") ||
      message.includes("etimedout") ||
      message.includes("enotfound") ||
      message.includes("networkerror") ||
      error.name === "TimeoutError" ||
      error.name === "NetworkError" ||
      error.name === "AbortError"
    ) {
      // Check if it's specifically a timeout
      if (message.includes("timeout") || error.name === "TimeoutError" || error.name === "AbortError") {
        return {
          code: "TIMEOUT_ERROR",
          message: error.message,
          userMessage: "⏱️ Request timeout - please check your connection and try again",
          icon: "⏱️",
          severity: "error",
        };
      }
      
      return {
        code: "NETWORK_ERROR",
        message: error.message,
        userMessage: "🌐 Connection Error: Check your internet connection and try again",
        icon: "🌐",
        severity: "error",
      };
    }

    if (message.includes("rate limit") || message.includes("429")) {
      return {
        code: "RATE_LIMIT",
        message: error.message,
        userMessage: "⚡ Too Many Requests: Please wait a moment",
        icon: "⚡",
        severity: "warning",
      };
    }

    if (message.includes("permission") || message.includes("denied")) {
      return {
        code: "PERMISSION_ERROR",
        message: error.message,
        userMessage: "🔒 Permission Denied: Check app settings",
        icon: "🔒",
        severity: "error",
      };
    }

    if (message.includes("not found") || message.includes("404")) {
      return {
        code: "NOT_FOUND",
        message: error.message,
        userMessage: "🔍 Not Found: The requested item doesn't exist",
        icon: "🔍",
        severity: "warning",
      };
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return {
        code: "VALIDATION_ERROR",
        message: error.message,
        userMessage: "✓ Validation Error: Please check your input",
        icon: "✓",
        severity: "warning",
      };
    }

    // Generic error
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      userMessage: "An unexpected error occurred. Please try again.",
      icon: "⚠️",
      severity: "error",
    };
  }

  // Fallback
  return {
    code: "UNKNOWN",
    message: String(error),
    userMessage: "An unexpected error occurred",
    icon: "⚠️",
    severity: "error",
  };
};

/**
 * Get error message for user display
 */
export const getUserErrorMessage = (error: any): string => {
  return parseError(error).userMessage;
};

/**
 * Log error for debugging
 */
export const logError = (context: string, error: any): void => {
  const parsed = parseError(error);
  console.error(`[${context}] ${parsed.code}:`, parsed.message);
};
