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
 * Get or create the StudyPal calendar
 */
export const getOrCreateStudyPalCalendar = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const studyPalCalendar = calendars.find((cal) => cal.title === "StudyPal");

    if (studyPalCalendar) {
      return studyPalCalendar.id;
    }

    // Create new StudyPal calendar
    const defaultCalendarSource =
      Platform.OS === "ios"
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: "StudyPal", type: Calendar.SourceType.LOCAL };

    if (!defaultCalendarSource) {
      console.error("No default calendar source available");
      return null;
    }

    const newCalendarId = await Calendar.createCalendarAsync({
      title: "StudyPal",
      color: "#4CAF50",
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: "StudyPal",
      ownerAccount: "personal",
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
  } catch (error) {
    console.error("Error getting or creating StudyPal calendar:", error);
    return null;
  }
};

/**
 * Get default calendar source (iOS)
 */
const getDefaultCalendarSource = async () => {
  try {
    const sources = await Calendar.getSourcesAsync();
    const defaultSource = sources.find(
      (source) => source.type === Calendar.SourceType.CALDAV || source.type === Calendar.SourceType.LOCAL
    );
    return defaultSource || sources[0];
  } catch (error) {
    console.error("Error getting default calendar source:", error);
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
  reminderMinutes: number = 60
): Promise<string | null> => {
  try {
    const calendarId = await getOrCreateStudyPalCalendar();
    if (!calendarId) {
      return null;
    }

    // Create event at the due date time
    const startDate = new Date(dueDate);
    const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `📚 ${taskTitle}`,
      startDate,
      endDate,
      notes: taskDescription,
      alarms: [{ relativeOffset: -reminderMinutes }],
      timeZone: "GMT",
    });

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
  notes?: string
): Promise<string | null> => {
  try {
    const calendarId = await getOrCreateStudyPalCalendar();
    if (!calendarId) {
      return null;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `📖 Study: ${sessionTitle}`,
      startDate,
      endDate,
      notes: notes || "StudyPal study session",
      alarms: [{ relativeOffset: -5 }], // 5 minutes before
      timeZone: "GMT",
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
  endDate: Date
): Promise<Calendar.Event[]> => {
  try {
    const calendarId = await getOrCreateStudyPalCalendar();
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
      return await addTaskToCalendar(taskTitle, taskDescription, dueDate);
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
