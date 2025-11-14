# Performance & Speed Review

## 🔴 CRITICAL PERFORMANCE ISSUES

### 1. **Unnecessary Re-renders: Subscribing to Entire Arrays**

**Location:** `src/screens/HomeScreen.tsx:35`
**Issue:** Component subscribes to entire `tasks` array, causing re-render on ANY task change
```typescript
const tasks = useTaskStore((s) => s.tasks); // ❌ Re-renders on any task change
```

**Impact:** 
- HomeScreen re-renders whenever ANY task is added/updated/deleted
- All child components re-render unnecessarily
- Performance degrades with large task lists (100+ tasks)

**Fix:**
```typescript
// Use selector that only re-renders when needed
const todayTasks = useTaskStore((s) => {
  const userId = user?.id;
  if (!userId) return [];
  return s.getTodayTasks(userId);
});

// Or use useMemo to memoize filtered results
const todayTasks = useMemo(() => {
  if (!user?.id) return [];
  return getTodayTasks(user.id);
}, [user?.id, tasks.length]); // Only recalculate when user or task count changes
```

---

### 2. **Expensive Computations Without Memoization**

**Location:** `src/state/taskStore.ts:205-255`
**Issue:** Filter operations run on every call, even when data hasn't changed
```typescript
getTasksByDate: (date: Date, userId: string) => {
  const tasks = get().tasks;
  return tasks.filter((task) => {
    // Runs filter on entire array every time
    if (task.userId !== userId) return false;
    const taskDate = new Date(task.dueDate); // Creates new Date object
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
}
```

**Impact:**
- O(n) complexity on every call
- Creates new Date objects for every task
- Called multiple times per render cycle
- With 100 tasks, this runs 100+ date comparisons per render

**Fix:** Add memoization and indexing
```typescript
// Add to store state
private tasksByDateCache: Map<string, Task[]> = new Map();
private tasksByDateCacheKey: string | null = null;

getTasksByDate: (date: Date, userId: string) => {
  const cacheKey = `${userId}-${date.toISOString().split('T')[0]}`;
  const tasks = get().tasks;
  
  // Check cache
  if (this.tasksByDateCacheKey === cacheKey && this.tasksByDateCache.has(cacheKey)) {
    return this.tasksByDateCache.get(cacheKey)!;
  }
  
  // Pre-compute date boundaries
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = tasks.filter((task) => {
    if (task.userId !== userId) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= startOfDay && taskDate <= endOfDay;
  });
  
  // Cache result
  this.tasksByDateCache.set(cacheKey, result);
  this.tasksByDateCacheKey = cacheKey;
  return result;
}
```

---

### 3. **Heavy Group Analytics Calculation**

**Location:** `src/utils/groupAnalytics.ts:32-114`
**Issue:** Multiple nested filters, sorts, and array operations
```typescript
export function calculateGroupAnalytics(group: Group, tasks: Task[], allUsers?: User[]): GroupAnalytics {
  const groupTasks = tasks.filter((task) => task.groupId === group.id); // Filter 1
  const studentProgress: StudentProgress[] = group.studentIds.map((studentId) => {
    const studentTasks = groupTasks.filter((task) => task.userId === studentId); // Filter 2 (nested)
    const completedTasks = studentTasks.filter((task) => task.status === "completed"); // Filter 3 (nested)
    // ...
    const lastActive = completedTasks.length > 0
      ? completedTasks.sort((a, b) => // Sort on every call
          new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
        )[0].completedAt
      : undefined;
  });
  // More filters and sorts...
}
```

**Impact:**
- O(n²) complexity: For each student, filters all tasks
- Multiple array sorts (expensive)
- Called on every render without memoization
- With 10 students and 100 tasks = 1000+ operations

**Fix:** Optimize with single-pass algorithm and memoization
```typescript
// Use Map for O(1) lookups
const userMap = new Map(allUsers?.map(u => [u.id, u]) || []);

// Single pass through tasks
const taskMap = new Map<string, Task[]>();
tasks.forEach(task => {
  if (task.groupId === group.id) {
    if (!taskMap.has(task.userId)) {
      taskMap.set(task.userId, []);
    }
    taskMap.get(task.userId)!.push(task);
  }
});

// Calculate progress in single pass
const studentProgress: StudentProgress[] = group.studentIds.map((studentId) => {
  const studentTasks = taskMap.get(studentId) || [];
  const completedTasks = studentTasks.filter(t => t.status === "completed");
  
  // Only sort if needed (lazy evaluation)
  const lastActive = completedTasks.length > 0
    ? completedTasks.reduce((latest, task) => {
        const taskDate = task.completedAt ? new Date(task.completedAt).getTime() : 0;
        return taskDate > latest ? taskDate : latest;
      }, 0)
    : undefined;
  
  // ... rest of calculation
});
```

---

### 4. **Streak Calculation Inefficiency**

**Location:** `src/utils/groupAnalytics.ts:119-163`
**Issue:** Sorts entire array on every call
```typescript
function calculateStreak(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;
  
  // Sorts entire array every time
  const sorted = [...completedTasks].sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );
  // ... rest of calculation
}
```

**Impact:**
- O(n log n) sort operation
- Creates new array copy
- Called for every student in group analytics
- With 50 completed tasks = expensive sort

**Fix:** Use single-pass algorithm
```typescript
function calculateStreak(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;
  
  // Find most recent date in single pass (O(n))
  let mostRecent = 0;
  const dates = new Set<string>();
  
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString();
      dates.add(dateStr);
      const time = date.getTime();
      if (time > mostRecent) mostRecent = time;
    }
  });
  
  // Calculate streak from unique dates
  const sortedDates = Array.from(dates).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // ... rest of streak calculation
}
```

---

### 5. **Memory Leak: setTimeout Without Cleanup**

**Location:** `src/state/taskStore.ts:37, 99, 157`
**Issue:** setTimeout calls not tracked or cleaned up
```typescript
setTimeout(async () => {
  // Calendar sync operation
  // ...
}, 0);
```

**Impact:**
- If component unmounts or store resets, setTimeout still fires
- Can cause state updates on unmounted components
- Memory leak if many tasks created quickly

**Fix:** Track and cleanup timeouts
```typescript
private syncTimeouts: Set<NodeJS.Timeout> = new Set();

addTask: (taskData) => {
  // ... create task ...
  
  const timeoutId = setTimeout(async () => {
    this.syncTimeouts.delete(timeoutId);
    // ... sync logic ...
  }, 0);
  
  this.syncTimeouts.add(timeoutId);
},

// Add cleanup method
cleanup: () => {
  this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
  this.syncTimeouts.clear();
}
```

---

### 6. **Inefficient Array Lookups**

**Location:** `src/state/studyRoomStore.ts:88-100, 315-349`
**Issue:** Using `.find()` and `.includes()` on arrays (O(n) operations)
```typescript
joinRoom: (roomId, userId, username, animal) => {
  const room = get().rooms.find((r) => r.id === roomId); // O(n)
  if (room.participantIds.includes(userId)) return true; // O(n)
  // ...
}

getRoom: (roomId) => {
  return get().rooms.find((r) => r.id === roomId); // O(n) every call
}
```

**Impact:**
- O(n) lookup time increases with number of rooms
- Called frequently during room operations
- With 50 rooms = 50 iterations per lookup

**Fix:** Use Map for O(1) lookups
```typescript
interface StudyRoomStore {
  rooms: StudyRoom[];
  roomsById: Map<string, StudyRoom>; // Add index
  // ...
}

createRoom: (/* ... */) => {
  // ... create room ...
  set((state) => {
    const newRoomsById = new Map(state.roomsById);
    newRoomsById.set(newRoom.id, newRoom);
    return {
      rooms: [...state.rooms, newRoom],
      roomsById: newRoomsById
    };
  });
}

getRoom: (roomId) => {
  return get().roomsById.get(roomId); // O(1) lookup
}
```

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 7. **Missing React.memo for Expensive Components**

**Location:** Multiple screen components
**Issue:** Components re-render even when props haven't changed
```typescript
// src/screens/TasksScreen.tsx
const TasksScreen = () => {
  // No React.memo, re-renders on any parent state change
}
```

**Impact:**
- Unnecessary re-renders cascade to children
- Expensive component trees re-render unnecessarily

**Fix:**
```typescript
const TasksScreen = React.memo(() => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.user?.id === nextProps.user?.id;
});
```

---

### 8. **Missing useMemo for Derived State**

**Location:** `src/screens/HomeScreen.tsx:81-89`
**Issue:** Filter function runs on every render
```typescript
const getTasksForDate = (date: Date) => {
  return tasks.filter((task) => {
    // Runs on every render, even if tasks/date haven't changed
  });
};
```

**Fix:**
```typescript
const tasksForSelectedDate = useMemo(() => {
  if (!user?.id) return [];
  return tasks.filter((task) => {
    if (task.userId !== user.id) return false;
    const taskDate = new Date(task.dueDate);
    return isSameDay(taskDate, selectedWeekDate);
  });
}, [tasks, user?.id, selectedWeekDate]);
```

---

### 9. **Multiple Date Object Creations**

**Location:** `src/state/taskStore.ts:211, 240, 252`
**Issue:** Creating new Date objects in filter callbacks
```typescript
const taskDate = new Date(task.dueDate); // Created for every task, every call
```

**Impact:**
- Object allocation overhead
- Garbage collection pressure
- With 100 tasks = 100+ Date objects per filter call

**Fix:** Pre-compute date boundaries or cache Date objects
```typescript
// Pre-compute once
const startOfDay = new Date(date);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(date);
endOfDay.setHours(23, 59, 59, 999);

// Compare timestamps instead
return tasks.filter((task) => {
  if (task.userId !== userId) return false;
  const taskTime = new Date(task.dueDate).getTime();
  return taskTime >= startOfDay.getTime() && taskTime <= endOfDay.getTime();
});
```

---

### 10. **Inefficient Activity Feed Filtering**

**Location:** `src/state/activityFeedStore.ts:64-80`
**Issue:** Multiple filters chained
```typescript
getActivities: (limit = 50) => {
  return get()
    .activities.filter((a) => a.isVisible) // Filter 1
    .slice(0, limit); // Slice after filter
}

getFriendActivities: (friendUserIds, limit = 50) => {
  return get()
    .activities.filter((a) => a.isVisible && friendUserIds.includes(a.userId)) // Includes is O(n)
    .slice(0, limit);
}
```

**Impact:**
- Multiple array passes
- `includes()` is O(n) for each activity
- With 100 activities and 10 friends = 1000+ operations

**Fix:** Single pass with Set for O(1) lookup
```typescript
getFriendActivities: (friendUserIds, limit = 50) => {
  const friendSet = new Set(friendUserIds); // O(1) lookup
  const activities = get().activities;
  const result: ActivityFeedItem[] = [];
  
  for (const activity of activities) {
    if (result.length >= limit) break;
    if (activity.isVisible && friendSet.has(activity.userId)) {
      result.push(activity);
    }
  }
  
  return result;
}
```

---

### 11. **No Debouncing for Translation API Calls**

**Location:** `src/hooks/useDynamicTranslation.ts:264-297`
**Issue:** Translation called on every text change
```typescript
useEffect(() => {
  const timer = setTimeout(async () => {
    // Translation API call
  }, 500); // 500ms debounce
  return () => clearTimeout(timer);
}, [text, from, language]);
```

**Impact:**
- API calls on every keystroke (after debounce)
- Can hit rate limits
- Unnecessary network requests

**Fix:** Increase debounce and add request cancellation
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  const timer = setTimeout(async () => {
    if (from === language || !text) {
      setTranslatedText(text);
      return;
    }
    
    try {
      const result = await translateWithCache(text, from, language, {
        signal: controller.signal
      });
      setTranslatedText(result.translatedText);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Realtime translation error:", error);
        setTranslatedText(text);
      }
    } finally {
      setIsTranslating(false);
    }
  }, 1000); // Increase to 1 second
  
  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [text, from, language]);
```

---

### 12. **Chat Message Filtering Inefficiency**

**Location:** `src/state/chatStore.ts:93-97`
**Issue:** Filters and sorts entire messages array on every call
```typescript
getRoomMessages: (studyRoomId) => {
  return get()
    .messages.filter((m) => m.studyRoomId === studyRoomId) // Filter
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort
}
```

**Impact:**
- O(n log n) sort on every call
- With 1000 messages = expensive operation
- Called frequently during chat

**Fix:** Index messages by roomId and maintain sorted order
```typescript
interface ChatStore {
  messages: ChatMessage[];
  messagesByRoom: Map<string, ChatMessage[]>; // Index by roomId
  // ...
}

sendMessage: (studyRoomId, userId, username, content) => {
  // ... create message ...
  
  set((state) => {
    const newMessages = [...state.messages, newMessage];
    const roomMessages = state.messagesByRoom.get(studyRoomId) || [];
    const newRoomMessages = [...roomMessages, newMessage].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const newMessagesByRoom = new Map(state.messagesByRoom);
    newMessagesByRoom.set(studyRoomId, newRoomMessages);
    
    return {
      messages: newMessages,
      messagesByRoom: newMessagesByRoom
    };
  });
}

getRoomMessages: (studyRoomId) => {
  return get().messagesByRoom.get(studyRoomId) || [];
}
```

---

## 💡 OPTIMIZATION RECOMMENDATIONS

### 13. **Add Zustand Selector Optimization**

**Location:** All Zustand stores
**Issue:** No shallow equality checks for selectors

**Fix:** Use `shallow` from zustand/shallow
```typescript
import { shallow } from 'zustand/shallow';

// In component
const { tasks, addTask } = useTaskStore(
  (state) => ({ tasks: state.tasks, addTask: state.addTask }),
  shallow
);
```

---

### 14. **Virtualize Long Lists**

**Location:** Task lists, activity feeds, chat messages
**Issue:** Rendering all items at once

**Fix:** Use `react-native-virtualized-view` or `FlatList` with proper configuration
```typescript
<FlatList
  data={tasks}
  renderItem={({ item }) => <TaskItem task={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

---

### 15. **Lazy Load Heavy Components**

**Location:** Analytics screens, group screens
**Issue:** Loading all data upfront

**Fix:** Use React.lazy and Suspense
```typescript
const GroupAnalyticsScreen = React.lazy(() => 
  import('./screens/GroupAnalyticsScreen')
);

<Suspense fallback={<LoadingSpinner />}>
  <GroupAnalyticsScreen />
</Suspense>
```

---

## 📊 PERFORMANCE METRICS ESTIMATES

### Current Performance (Estimated)
- **Task filtering:** ~5-10ms per call (100 tasks)
- **Group analytics:** ~50-100ms per call (10 students, 100 tasks)
- **Re-renders:** 3-5x more than necessary
- **Memory:** ~2-3MB overhead from inefficient data structures

### After Optimizations (Estimated)
- **Task filtering:** ~0.5-1ms per call (with caching)
- **Group analytics:** ~10-20ms per call (optimized algorithm)
- **Re-renders:** 60-80% reduction
- **Memory:** ~1MB reduction

---

## 🎯 PRIORITY FIX ORDER

1. **Immediate (Critical):**
   - Fix task store selectors (Issue #1)
   - Add memoization to task filters (Issue #2)
   - Fix setTimeout cleanup (Issue #5)

2. **High Priority:**
   - Optimize group analytics (Issue #3)
   - Add Map indexes for lookups (Issue #6)
   - Fix streak calculation (Issue #4)

3. **Medium Priority:**
   - Add React.memo to components (Issue #7)
   - Optimize activity feed filtering (Issue #10)
   - Improve chat message indexing (Issue #12)

4. **Nice to Have:**
   - Virtualize lists (Recommendation #14)
   - Lazy load components (Recommendation #15)
   - Add debouncing improvements (Issue #11)

---

## 🔧 IMPLEMENTATION NOTES

- **Backward Compatibility:** All fixes maintain existing API
- **Testing:** Performance improvements should be tested with 100+ tasks, 50+ rooms
- **Monitoring:** Add performance markers to measure improvements
- **Gradual Rollout:** Implement fixes incrementally and measure impact

