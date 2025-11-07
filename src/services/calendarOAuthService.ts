import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import * as Calendar from "expo-calendar";

// Important: For OAuth to work, you need to configure redirect URIs in Google Cloud Console
// The redirect URI should be: exp://localhost:8081 for development

WebBrowser.maybeCompleteAuthSession();

// Google Calendar OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_OAUTH_SCOPES = ["https://www.googleapis.com/auth/calendar"];

// OAuth Discovery for Google
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export interface CalendarOAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
  idToken?: string;
}

export interface CalendarProvider {
  id: string;
  name: string;
  type: "google" | "apple" | "outlook" | "device";
  isConnected: boolean;
  userEmail?: string;
  expiresAt?: Date;
}

/**
 * Get Google OAuth configuration for use in React components
 * This should be used with useAuthRequest hook in a component
 */
export const getGoogleOAuthConfig = () => {
  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Client ID not configured in environment variables");
    return null;
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "studentopia",
    path: "oauth-callback",
  });

  return {
    clientId: GOOGLE_CLIENT_ID,
    scopes: GOOGLE_OAUTH_SCOPES,
    redirectUri,
    discovery,
  };
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeGoogleAuthCode = async (
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<CalendarOAuthToken | null> => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Google Client ID not configured");
      return null;
    }

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: GOOGLE_CLIENT_ID,
        code,
        redirectUri,
        extraParams: {
          code_verifier: codeVerifier,
        },
      },
      discovery
    );

    return {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresIn: tokenResponse.expiresIn,
      tokenType: tokenResponse.tokenType || "Bearer",
      scope: tokenResponse.scope,
      idToken: tokenResponse.idToken,
    };
  } catch (error) {
    console.error("Error exchanging auth code:", error);
    return null;
  }
};

/**
 * Refresh Google Calendar OAuth token
 */
export const refreshGoogleToken = async (refreshToken: string): Promise<CalendarOAuthToken | null> => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Google Client ID not configured");
      return null;
    }

    const tokenResponse = await AuthSession.refreshAsync(
      {
        clientId: GOOGLE_CLIENT_ID,
        refreshToken,
      },
      discovery
    );

    return {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken || refreshToken,
      expiresIn: tokenResponse.expiresIn,
      tokenType: tokenResponse.tokenType || "Bearer",
    };
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return null;
  }
};

/**
 * Get list of calendars from Google Calendar API
 */
export const getGoogleCalendars = async (accessToken: string) => {
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google calendars:", error);
    return [];
  }
};

/**
 * Create a labeled calendar in Google Calendar
 */
export const createGoogleCalendar = async (
  accessToken: string,
  childName: string
): Promise<string | null> => {
  try {
    const calendarName = `Studentopia – ${childName}`;

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: calendarName,
        description: `Calendar for ${childName}'s Studentopia tasks and events`,
        timeZone: "UTC",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create calendar: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating Google calendar:", error);
    return null;
  }
};

/**
 * Add event to Google Calendar
 */
export const addEventToGoogleCalendar = async (
  accessToken: string,
  calendarId: string,
  eventData: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    reminderMinutes?: number;
  }
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.startDate.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: eventData.endDate.toISOString(),
            timeZone: "UTC",
          },
          reminders: {
            useDefault: false,
            overrides: [
              {
                method: "popup",
                minutes: eventData.reminderMinutes || 60,
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error adding event to Google Calendar:", error);
    return null;
  }
};

/**
 * Connect to Apple Calendar (EventKit)
 * This uses the native expo-calendar which already has EventKit integration
 */
export const connectAppleCalendar = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== "ios") {
      console.warn("Apple Calendar is only available on iOS");
      return false;
    }

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error connecting to Apple Calendar:", error);
    return false;
  }
};

/**
 * Get available calendar providers
 */
export const getAvailableProviders = (): CalendarProvider[] => {
  const providers: CalendarProvider[] = [
    {
      id: "device",
      name: "Device Calendar",
      type: "device",
      isConnected: false,
    },
  ];

  // Google Calendar (available on both platforms)
  if (GOOGLE_CLIENT_ID) {
    providers.push({
      id: "google",
      name: "Google Calendar",
      type: "google",
      isConnected: false,
    });
  }

  // Apple Calendar (iOS only)
  if (Platform.OS === "ios") {
    providers.push({
      id: "apple",
      name: "Apple Calendar",
      type: "apple",
      isConnected: false,
    });
  }

  // Outlook (future implementation)
  providers.push({
    id: "outlook",
    name: "Outlook Calendar",
    type: "outlook",
    isConnected: false,
  });

  return providers;
};

/**
 * Revoke Google Calendar access
 */
export const disconnectGoogleCalendar = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return false;
  }
};
