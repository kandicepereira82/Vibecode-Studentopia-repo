import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

/**
 * Request calendar permissions from the user
 */
export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== "granted") {
      console.warn("Calendar permission not granted");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting calendar permissions:", error);
    return false;
  }
};

/**
 * Get all available calendars on the device
 */
export const getDeviceCalendars = async () => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  } catch (error) {
    console.error("Error getting calendars:", error);
    return [];
  }
};

/**
 * Get or create a child-specific Studentopia calendar
 * Format: "Studentopia – [Child's Name]"
 */
export const getOrCreateStudentopiaCalendar = async (childName: string): Promise<string | null> => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return null;
    }

    const calendarTitle = `Studentopia – ${childName}`;
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const existingCalendar = calendars.find((cal) => cal.title === calendarTitle);

    if (existingCalendar) {
      return existingCalendar.id;
    }

    // Create new child-specific Studentopia calendar
    const defaultCalendarSource =
      Platform.OS === "ios"
        ? await getDefaultCalendarSource()
        : await getGoogleCalendarSource();

    if (!defaultCalendarSource) {
      console.error("No default calendar source available");
      return null;
    }

    console.log("Creating calendar with source:", {
      name: defaultCalendarSource.name,
      type: defaultCalendarSource.type,
      isLocalAccount: defaultCalendarSource.isLocalAccount,
    });

    const newCalendarId = await Calendar.createCalendarAsync({
      title: calendarTitle,
      color: "#4CAF50", // Studentopia green
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: calendarTitle,
      ownerAccount: defaultCalendarSource.name || "personal",
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    console.log("Successfully created calendar:", calendarTitle, "with ID:", newCalendarId);

    return newCalendarId;
  } catch (error) {
    console.error("Error getting or creating Studentopia calendar:", error);
    return null;
  }
};

/**
 * Get all Studentopia calendars (for multiple children)
 */
export const getAllStudentopiaCalendars = async () => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // Filter calendars that start with "Studentopia"
    return calendars.filter((cal) => cal.title.startsWith("Studentopia"));
  } catch (error) {
    console.error("Error getting Studentopia calendars:", error);
    return [];
  }
};

/**
 * Delete a child-specific Studentopia calendar
 */
export const deleteStudentopiaCalendar = async (calendarId: string): Promise<boolean> => {
  try {
    await Calendar.deleteCalendarAsync(calendarId);
    return true;
  } catch (error) {
    console.error("Error deleting Studentopia calendar:", error);
    return false;
  }
};

/**
 * Get default calendar source (iOS)
 * Prioritizes iCloud and synced calendars over local-only calendars
 */
const getDefaultCalendarSource = async () => {
  try {
    const sources = await Calendar.getSourcesAsync();

    // Priority 1: iCloud calendar source (best for Apple ecosystem sync)
    const iCloudSource = sources.find(
      (source) =>
        source.type === Calendar.SourceType.CALDAV &&
        (source.name?.toLowerCase().includes("icloud") ||
         source.name === "Default")
    );

    if (iCloudSource) {
      console.log("Found iCloud calendar source:", iCloudSource.name);
      return iCloudSource;
    }

    // Priority 2: Any CalDAV source (Gmail, Outlook, etc.)
    const calDavSource = sources.find(
      (source) => source.type === Calendar.SourceType.CALDAV
    );

    if (calDavSource) {
      console.log("Found CalDAV calendar source:", calDavSource.name);
      return calDavSource;
    }

    // Priority 3: Any non-local source
    const cloudSource = sources.find(
      (source) => !source.isLocalAccount
    );

    if (cloudSource) {
      console.log("Found cloud calendar source:", cloudSource.name);
      return cloudSource;
    }

    // Last resort: use first available source (even if local)
    console.warn("No synced calendar found, using first available source");
    return sources[0] || null;
  } catch (error) {
    console.error("Error getting default calendar source:", error);
    return null;
  }
};

/**
 * Get Google Calendar source (Android)
 * Tries to find a Google account calendar source for proper sync
 */
const getGoogleCalendarSource = async () => {
  try {
    const sources = await Calendar.getSourcesAsync();

    // Try to find Google account first
    const googleSource = sources.find(
      (source) =>
        source.name?.toLowerCase().includes("google") ||
        source.type === "com.google"
    );

    if (googleSource) {
      console.log("Found Google Calendar source:", googleSource.name);
      return googleSource;
    }

    // Fallback to any non-local account
    const cloudSource = sources.find(
      (source) => !source.isLocalAccount
    );

    if (cloudSource) {
      console.log("Found cloud calendar source:", cloudSource.name);
      return cloudSource;
    }

    // Last resort: use first available source
    console.warn("No Google or cloud calendar found, using first available source");
    return sources[0] || null;
  } catch (error) {
    console.error("Error getting Google calendar source:", error);
    return null;
  }
};

/**
 * Add a task to the calendar
 */
export const addTaskToCalendar = async (
  taskTitle: string,
  taskDescription: string,
  dueDate: Date,
  childName: string,
  reminderMinutes: number = 60
): Promise<string | null> => {
  try {
    const calendarId = await getOrCreateStudentopiaCalendar(childName);
    if (!calendarId) {
      console.error("Failed to get calendar for task creation");
      return null;
    }

    // Create event at the due date time
    const startDate = new Date(dueDate);
    const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log("Creating calendar event:", {
      title: taskTitle,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezone,
      calendarId,
    });

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `📚 ${taskTitle}`,
      startDate,
      endDate,
      notes: taskDescription,
      alarms: [{ relativeOffset: -reminderMinutes }],
      timeZone: timezone,
    });

    console.log("Successfully created event with ID:", eventId);
    return eventId;
  } catch (error) {
    console.error("Error adding task to calendar:", error);
    return null;
  }
};

/**
 * Add a study session to the calendar
 */
export const addStudySessionToCalendar = async (
  sessionTitle: string,
  startTime: Date,
  durationMinutes: number,
  childName: string,
  notes?: string
): Promise<string | null> => {
  try {
    const calendarId = await getOrCreateStudentopiaCalendar(childName);
    if (!calendarId) {
      return null;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `📖 Study: ${sessionTitle}`,
      startDate,
      endDate,
      notes: notes || "Studentopia study session",
      alarms: [{ relativeOffset: -5 }], // 5 minutes before
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    return eventId;
  } catch (error) {
    console.error("Error adding study session to calendar:", error);
    return null;
  }
};

/**
 * Update a calendar event
 */
export const updateCalendarEvent = async (
  eventId: string,
  updates: {
    title?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
  }
): Promise<boolean> => {
  try {
    await Calendar.updateEventAsync(eventId, updates);
    return true;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return false;
  }
};

/**
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return false;
  }
};

/**
 * Get events from calendar for a date range
 */
export const getCalendarEvents = async (
  startDate: Date,
  endDate: Date,
  childName: string
): Promise<Calendar.Event[]> => {
  try {
    const calendarId = await getOrCreateStudentopiaCalendar(childName);
    if (!calendarId) {
      return [];
    }

    const events = await Calendar.getEventsAsync([calendarId], startDate, endDate);
    return events;
  } catch (error) {
    console.error("Error getting calendar events:", error);
    return [];
  }
};

/**
 * Sync task with calendar (add or update)
 */
export const syncTaskWithCalendar = async (
  taskId: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: Date,
  childName: string,
  existingEventId?: string
): Promise<string | null> => {
  try {
    if (existingEventId) {
      // Update existing event
      const success = await updateCalendarEvent(existingEventId, {
        title: `📚 ${taskTitle}`,
        startDate: dueDate,
        endDate: new Date(dueDate.getTime() + 60 * 60 * 1000),
        notes: taskDescription,
      });
      return success ? existingEventId : null;
    } else {
      // Create new event
      return await addTaskToCalendar(taskTitle, taskDescription, dueDate, childName);
    }
  } catch (error) {
    console.error("Error syncing task with calendar:", error);
    return null;
  }
};

/**
 * Check if calendar permissions are granted
 */
export const hasCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking calendar permissions:", error);
    return false;
  }
};

/**
 * Connect to Apple Calendar (EventKit)
 * This requests calendar permissions on iOS
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
