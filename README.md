# Studentopia - Your Personal Study Companion

Studentopia is a comprehensive mobile productivity app designed for students to stay organized, complete tasks, maintain focus, and promote wellness. Built with React Native and Expo, it features a colorful, playful, and highly customizable interface with **25 adorable animal companions** and **8 dynamic themes**.

## ✨ Latest Updates

- ✅ **Authentication Flow Restored** - Onboarding now properly leads to email/password authentication screen for both new signups and returning users. User preferences collected during onboarding (name, animal, theme, role) are preserved and applied after authentication completes.
- ✅ **Rules Button Fixed** - "Read Full Rules & Guidelines" button in create group modal now opens the full rules modal. Enhanced with event propagation handling, expanded touch area (hitSlop), and better pressable styling for reliable interaction.
- ✅ **Teacher Dashboard Complete** - Teachers can now view student lists, see progress tracking for each group task (completion percentage, progress bars, individual student completion indicators), and assign tasks to groups. Student progress displayed with visual indicators showing who completed what.
- ✅ **Onboarding Theme Fix** - Fixed theme not applying after onboarding. Users now go directly to the app with their selected theme instead of being redirected to authentication.
- ✅ **Phase 1 Integration Complete** - Toast notification system integrated into TasksScreen, AIHelperScreen, and GroupsScreen. Custom Zustand selectors optimized for better performance. Error utilities applied for consistent error handling across the app.
- ✅ **Animal Label Fixed** - Changed "lamb" to "pig" throughout codebase (type definitions, utilities, and components). Pig and hamster image mappings corrected.
- ✅ **Group Permission Checks Enhanced** - Added userId parameter to updateGroup() and regenerateShareCode() with proper permission enforcement. Teachers cannot leave groups they created.
- ✅ **Quick Wins Sprint Complete** - Fixed animal name mapping bugs, added form error feedback, improved task reminder UX, enhanced AI error messages, validated past due dates, extracted 70+ lines of duplicated code
- ✅ **Polish Sprint Complete** - Created centralized theme utilities, standardized error handling system, optimized Zustand selectors with custom hooks, added toast notification system, created keyboard management utilities
- ✅ **Complete Offline Mode System** - App works fully offline with automatic data caching, offline action queueing, and auto-sync when reconnected. Offline indicator shows connection status and sync progress.
- ✅ **Comprehensive Reminder & Notification System** - Added sound/vibration toggles, mindfulness break reminders after 45-60 min focus, notification permission controls, with theme-aware UI
- ✅ **Task Reminder System** - Added customizable reminder date/time picker below Due Date section when adding/editing tasks with automatic notification scheduling
- ✅ **Daily Study Reminder System** - Added 20 rotating motivational messages displayed on Home Page header, switching daily with dynamic companion name integration (e.g., "Tomo's cheering you on!")
- ✅ **Calendar Sync Instructions** - Added comprehensive help modal with step-by-step instructions on how to enable and use calendar sync feature
- ✅ **Growth Mindset Study Reminders** - Daily study reminder messages now integrate growth mindset principles (effort, learning, challenges, progress) with 20+ varied messages randomized by time of day
- ✅ **Time-Based Study Reminder Messages** - Daily study reminders now show contextual greetings (Good morning, Good afternoon, Good evening, Good night) based on reminder time
- ✅ **Daily Study Reminder 12-Hour Time Picker** - Settings now feature 12-hour format with AM/PM toggle, direct time input fields, and correct up/down button logic
- ✅ **Daily Study Reminder Time Picker** - Settings now include option to choose custom time for daily study reminders with hour/minute selector
- ✅ **Theme-Consistent Mindfulness Page** - All UI elements on Mindfulness page now dynamically use the user's selected theme color scheme (primary, secondary colors)
- ✅ **Music Player Loading Fixed** - Removed empty URI parameter that was blocking local file playback
- ✅ **Audio Mode Initialized** - Added proper Audio.setAudioModeAsync() setup to enable playback of alarm sounds
- ✅ **Alarm Sounds Working** - Fixed sound loading to properly preload all alarm sounds on app start for reliable playback
- ✅ **Alarm Sounds Fixed** - Refactored alarm sound loading to properly import MPEG files for instant playback
- ✅ **Alarm Sounds Updated** - Timer alarm sounds now use local uploaded audio files (Beep, Wind Chime, Gong, Ocean Waves)
- ✅ **Music Player Fixed** - Updated music library to use local audio files (4 meditation tracks now available)
- ✅ **Refined Task Category Tabs** - Reduced tab heights with compact rectangular design and even 12px spacing between all tabs
- ✅ **Reset Button on Breathwork Timer** - Added refresh icon button to reset breathwork session to default 5-minute duration
- ✅ **First Name Only Greeting** - Home page now displays first name only in personalized greeting
- ✅ **Companion in Mindfulness Header** - Studentopia Companion now appears to the right of "Mindfulness Break" heading
- ✅ **Mindfulness Importance Note** - Informational message highlighting how mindfulness reduces stress and calms nerves
- ✅ **Mindfulness Tabs Streamlined** - Removed Timer tab, now featuring Breathwork, Tips, and Acupressure
- ✅ **Breathwork Session Timer** - Customizable total session time with +/- controls (1-60 minutes) for breathwork exercises
- ✅ **Theme-Aware Buttons** - All Mindfulness page buttons now match the selected theme color scheme
- ✅ **Improved Breathwork Animation** - Circle stays enlarged during hold phase and small during exhale hold phase
- ✅ **Parent Support Guide** - Added "Ask a Parent for Help" section to acupressure guide
- ✅ **Increased Tab Spacing** - Tabs on mindfulness page have better spacing and readability
- ✅ **Mindfulness Break Page** - New dedicated tab for meditation and stress relief featuring calming design and serene visual style
- ✅ **Mindfulness Timer** - Customizable timer with start/pause/resume/stop controls and visual progress feedback
- ✅ **Breathwork Exercises** - Two guided breathing techniques: Box Breathing (4-4-4-4) and 4-6 Breathing with animated circle guidance
- ✅ **Animated Breathing Guide** - Circle grows on inhale and shrinks on exhale to guide breathing rhythm
- ✅ **Stress Management Tips** - Curated collection of mindfulness quotes from Eckhart Tolle, Thich Nhat Hanh, Buddha, and others
- ✅ **Acupressure Guide** - Visual guide with 4 key acupressure points (Yintang, Shen Men, Neiguan, Hegu) with instructions and safety disclaimer
- ✅ **Studentopia Companion Integration** - Red Panda breathes along and provides encouragement during mindfulness sessions
- ✅ **Calming Design** - Soft pastels, rounded edges, minimalist layout with smooth animations
- ✅ **Email Validation on Onboarding** - Step 1 now validates email format with real-time error feedback
- ✅ **Form Validation** - Required field validation prevents proceeding without entering name
- ✅ **Authentication System** - Full login/signup system with email and password protection
- ✅ **User Registration** - Create new accounts with email, password, and full name
- ✅ **User Login** - Return users can log back into their accounts
- ✅ **Password Hashing** - Secure password storage using SHA256 hashing
- ✅ **Fixed Animal Grid Layout** - Step 3 now displays all 25 animals in a perfect 5×5 grid with seamless scrolling
- ✅ **Corrected Animal Images** - All 25 animal companions now display with the correct matching images
- ✅ **Enhanced Onboarding Experience** - New 4-step guided setup with Studentopia Companion welcome and role selection
- ✅ **Real-Time Theme Preview** - See your Studentopia Companion in your chosen theme before completing setup
- ✅ **Student/Teacher Role Selection** - Personalized experience based on your role
- ✅ **Dynamic Companion Preview** - Watch your companion's name update in real-time during onboarding
- ✅ **Celebration Animation** - Motivational welcome message when you complete setup
- ✅ **Time-Based Personalized Greetings** - Welcome messages change based on time of day (morning, afternoon, evening, night)
- ✅ **Studentopia Companion Engagement Messages** - Your companion provides friendly task reminders and motivational messages on home page
- ✅ **Smart Task Reminders** - Gentle prompts when no tasks are added, with encouraging messages for daily and weekly goals
- ✅ **Dynamic Encouragement** - Real-time motivational messages based on task completion progress
- ✅ **Quick Task Creation** - Add tasks directly from empty state with convenient button
- ✅ **Studentopia Companion Integration** - Companion now appears throughout the app for consistent guidance and engagement
- ✅ **Static Companion Images** - Removed distracting animations, replaced with friendly static images for cleaner UI
- ✅ **Companion in Quotes & Tips** - Your companion now appears alongside motivational quotes and study tips
- ✅ **Companion in Timer** - Your companion guides you during focus sessions and break times
- ✅ **Companion in Tasks** - Your companion appears in the task header to support your productivity
- ✅ **Fixed Name Display** - Companion name now appears once only on home page, no duplication
- ✅ **Weekly Goal Display** - Weekly goal now displays "tasks completed" for clear progress tracking
- ✅ **Enhanced Timer Features** - Custom time input, alarm sound selection, and color-coded backgrounds (green for study, blue for breaks)
- ✅ **Custom Duration Input** - Directly type any study/break duration (1-120 minutes) with dedicated modal
- ✅ **Continuous Alarm with Snooze** - Alarm sounds play repeatedly until dismissed with beautiful snooze modal
- ✅ **Fixed Alarm Sound Issues** - Updated sound URLs to reliable sources (Mixkit) for Beep and Gentle alarms
- ✅ **Instant Alarm Sounds** - Preloaded alarm sounds for zero-delay playback when timer completes or previewing sounds
- ✅ **Alarm Sound Preview** - Play sample sounds when choosing alarm to hear before selecting
- ✅ **Alarm Volume Control** - Adjust alarm sound volume with easy-to-use slider (0-100%)
- ✅ **Alarm Sound Options** - Choose from 4 different alarm sounds (Bell, Chime, Beep, Gentle) to play when timer completes
- ✅ **Theme-Based Timer Tabs** - Study and Break mode tabs now use dynamic theme colors matching your selected theme
- ✅ **Color-Coded Backgrounds** - Study sessions show green background, break sessions show blue background for clear visual distinction
- ✅ **Fixed Pause/Resume Functionality** - Pause button now properly pauses (not stops) and shows "Resume" when timer has remaining time
- ✅ **Theme-Based Timer Buttons** - All timer control buttons now use dynamic theme colors (primary, secondary, accent) for consistent theming
- ✅ **Modern Timer Controls** - Rectangular buttons (120px × 56px) with rounded edges, text labels, and consistent styling across Home and Timer screens
- ✅ **Unified Timer UI** - Home screen Quick Timer now matches Timer page style with rectangular buttons and gradient backgrounds
- ✅ **Simplified Profile Screen** - Removed stats section for cleaner, more focused profile management
- ✅ **Music Player Integration** - Music player moved from separate tab to Timer screen for seamless study sessions
- ✅ **Code Quality Improvements** - Fixed all functional errors including Alert usage, console.log statements, type safety, and React hooks
- ✅ **Custom Alert Modal** - Replaced native Alert.alert() with beautiful custom modal component following Apple HIG
- ✅ **Type Safety Enhanced** - Fixed unsafe type casts and added proper TypeScript return types
- ✅ **React Best Practices** - Fixed useEffect dependency arrays to prevent stale closure bugs
- ✅ **Clean Code** - Removed all console.log statements for production-ready code
- ✅ **Group Rules & Safety** - Comprehensive rules modal covering behavior, appropriate content, privacy, and consequences
- ✅ **Group Search** - Search groups by school, class name, teacher email, name, or description
- ✅ **Enhanced Group Creation** - Added optional fields for school, class, and email with mandatory rules acceptance
- ✅ **Fixed Timer Synchronization** - Timer state now shared across Home and Timer screens with centralized interval management
- ✅ **Fixed Timer Seconds Skipping** - Eliminated duplicate intervals that caused seconds to skip (58→56→54)
- ✅ **Calendar Week View** - Toggle between month and week views with fully functional navigation
- ✅ **Add Tasks from Calendar** - Double-tap any date to quickly create tasks for that day
- ✅ **Calendar Integration Guide** - Complete guide for syncing with Google Calendar and Apple Calendar (see CALENDAR_INTEGRATION.md)
- ✅ **Fixed Timer Display** - Timer now displays correctly as "25:00" on a single line
- ✅ **Task Time Selection** - Added time picker to tasks alongside date selection for precise scheduling
- ✅ **Enhanced Task Display** - All task views now show both date and time (Home, Tasks, Calendar screens)
- ✅ **Enhanced Home Screen** - Added week calendar view and replaced progress card with interactive Quick Timer
- ✅ **Week Calendar Widget** - Beautiful week view showing tasks for each day with visual indicators
- ✅ **Quick Timer on Home** - Start study sessions directly from home screen with play/pause/stop controls
- ✅ **Consistent Modern UI Design** - All screens now feature the same beautiful Poppins font, soft rounded corners (20-24px), gentle shadows, and clean white cards
- ✅ **Complete Design System** - HomeScreen, TasksScreen, CalendarScreen, TimerScreen, MusicPlayerScreen, AIHelperScreen, StudyTipsScreen, and GroupsScreen all updated with consistent styling
- ✅ **Poppins Font Family** - Beautiful rounded font in Regular, Medium, SemiBold, and Bold weights throughout the entire app
- ✅ **Enhanced Visual Design** - All cards feature soft shadows for depth, circular icon containers, and consistent spacing
- ✅ **Fixed Blank Screen Issue** - Improved app initialization to properly detect and handle invalid user data
- ✅ **Automatic Error Recovery** - App now automatically shows onboarding if user data is corrupted
- ✅ **14 Languages Supported** - Full multilingual support: English, Spanish, French, German, Chinese, Japanese, Arabic, Korean, Portuguese (BR), Hindi, Italian, Turkish, Russian, and Indonesian
- ✅ **Music Player** - Calming classical music from Pixabay with full playback controls, mood filters, and volume adjustment
- ✅ **25 Adorable Animal Companions** - New digital art style with friendly, bright-eyed Study Pals: Cat, Red Panda, Owl, Penguin, Horse, Dog, Chick, Bear, Hedgehog, Tiger, Turtle, Bunny, Giraffe, Lamb, Alpaca, Lion, Frog, Koala, Sloth, Monkey, Hamster, Reindeer, Chipmunk, Elephant, and Goldfish
- ✅ **Celebration Animations** - Animated celebration modal with your Study Pal when you complete tasks
- ✅ **10 Dynamic Themes** - Blue, Purple, Pink, Green, Orange, Red, Teal, Indigo, Rose, and Amber
- ✅ **Mood-Based Animations** - Study Pal changes mood (happy, focused, celebrating, relaxed) based on your progress
- ✅ **Improved Timer Display** - Fixed font size for better readability

## Features

### 📡 Offline Mode & Data Synchronization
- **Complete Offline Functionality**: All core features work without internet connection
  - Task creation, editing, completion (locally cached)
  - Study timer with full functionality
  - Mindfulness exercises and breathing guides
  - Local music playback and meditation
  - Motivational quotes and study tips
  - Profile and settings management
- **Automatic Sync**: Changes queued offline and auto-synced when online
- **Offline Indicator**: Visual status showing connection state
  - 🔴 Red when offline with changes pending
  - 🔄 Blue when syncing queued changes
  - ✅ Green showing successful sync count
- **Data Persistence**: All user data cached locally in AsyncStorage
- **Conflict Resolution**: Last-write-wins strategy for data consistency
- **See Also**: Detailed documentation in `OFFLINE_MODE.md` and `OFFLINE_ANALYSIS.md`

### 🎯 User Engagement & Personalization
- **Time-Based Greetings**: Personalized welcome messages that change throughout the day
  - Morning (5 AM - 12 PM): "Good morning, [username]!"
  - Afternoon (12 PM - 5 PM): "Good afternoon, [username]!"
  - Evening (5 PM - 9 PM): "Good evening, [username]!"
  - Night (9 PM - 5 AM): "Great work today, [username]!"
- **Motivational Sub-Messages**: Random encouraging phrases to start your session
- **Smart Task Reminders**: Studentopia Companion provides friendly reminders based on your task status
  - "You have 3 tasks due today — let's do this!"
  - "No tasks for today yet. Let's add your goals!"
  - "Amazing! You've completed all tasks today! 🎉"
- **Weekly Goal Prompts**: Gentle encouragement to plan ahead when no tasks are scheduled
- **Progress-Based Encouragement**: Real-time motivational messages based on completion rates
  - 100%: "Perfect! You're on fire today! 🔥"
  - 75%+: "Great progress! Keep it up!"
  - 50%+: "You're halfway there! Keep going!"
- **Empty State Guidance**: Helpful prompts with quick actions when no tasks exist
- **Studentopia Companion Welcome Card**: Dedicated card on home screen with personalized messages from your companion

### 📝 Core Task Management
- **Task CRUD Operations**: Add, edit, delete, and complete tasks
- **Task Categories**: Homework, projects, exams, and other custom categories
- **Due Dates & Times**: Set both date and time for precise task scheduling
- **Task Reminders**:
  - Custom reminder date & time picker integrated below Due Date section
  - Automatic notification scheduling at specified reminder time
  - Visual reminder indicator on task cards showing reminder date/time
  - Edit/delete reminder functionality with notification cancellation
  - Automatic reminder cancellation when task is marked complete
- **Task Filtering**: Filter tasks by category and status
- **Progress Tracking**: Daily and weekly progress bars with visual feedback
- **🎉 Celebration Animations**: Animated modal with your Study Pal celebrating when tasks are completed
- **Task Status**: Mark tasks as pending or completed with instant feedback

### 📅 Calendar Integration
- **Month & Week Views**: Toggle between comprehensive month view and focused week view
- **Interactive Calendar**: Long-press any date to quickly create tasks for that day
- **Date Selection**: Tap any date to view all tasks scheduled for that day
- **Task Indicators**: Visual dots showing pending (orange) and completed (green) tasks
- **Smart Navigation**: Easy navigation between months or weeks with previous/next buttons
- **Calendar Sync**: Integration with Google Calendar and Apple Calendar (see CALENDAR_INTEGRATION.md)
- **Export/Import**: Export tasks as .ics files for calendar apps

### ⏱️ Study Timer (Pomodoro)
- **Customizable Sessions**: Adjustable study (1-120 min) and break (1-60 min) durations
- **Custom Time Input**: Type any duration directly with dedicated modal input
- **Visual Timer**: Large, optimized countdown display that fits on one line
- **Color-Coded Backgrounds**: Green background for study mode, blue background for break mode
- **Session Modes**: Toggle between study (green) and break (blue) modes
- **Alarm Sounds**: Choose from 4 different alarm sounds (Bell, Chime, Beep, Gentle)
- **Completion Alert**: Plays selected alarm sound when timer completes
- **Study Tracking**: Automatically logs study minutes to your stats
- **Synchronized State**: Timer state shared across Home and Timer screens
- **Quick Timer**: Start study sessions directly from home screen
- **Background Music**: Toggle calming music during study/break sessions
- **Music Controls**: Integrated music player with play/pause, stop, volume control, and track selection
- **Music Library**: Choose from curated classical music tracks filtered by mood
- **Modern UI**: Rectangular control buttons with rounded edges and theme colors

### 👥 Groups & Collaboration
- **Create Groups**: Both teachers and students can create groups with name, description, school, class, and teacher email
- **Join Groups**: Students can join groups using 6-character share codes or QR codes
- **Share Options**: Copy code to clipboard, show QR code for scanning, or regenerate code
- **Search Groups**: Search by school name, class name, teacher email, group name, or description
- **Group Rules**: Comprehensive safety guidelines covering respectful behavior, appropriate content, privacy, and consequences
- **Rules Acceptance**: Mandatory rules acceptance checkbox before creating a group
- **Task Management**: View and manage group tasks with member count tracking
- **How-To Guide**: Built-in comprehensive guide for creating, joining, and managing groups

### 🎵 Music Player
- **Integrated in Timer**: Background music player available during study and break sessions
- **Curated Classical Music**: 6 calming, peaceful, and uplifting tracks from Pixabay
- **Full Playback Controls**: Play, pause, stop, and seek functionality
- **Volume Control**: Adjustable volume slider (0-100%)
- **Mood-Based Selection**: Filter music by calming, uplifting, or peaceful moods
- **Now Playing Display**: Beautiful card showing current track with progress bar
- **Easy Integration**: Simple workflow to add Pixabay music (see PIXABAY_MUSIC_GUIDE.md)
- **Royalty-Free**: All music is 100% free for personal and commercial use

### 🤖 AI Learning Assistant
- **Chat Mode**: Get homework help, project research, content summarization, and resource suggestions
- **Grammar Checker Mode**: Check grammar, spelling, and punctuation with detailed explanations
- **Multi-language Support**: AI responds in your selected language
- **Conversation History**: View and manage your chat history
- **Clear Chat**: Reset conversations anytime

### 🎯 Motivation & Wellness
- **Daily Quotes**: Inspirational quotes from Big Life Journal, Dr. Shefali Tsabary, Einstein, and more
- **Study Tips**: Time management, focus techniques, and wellness advice
- **Mindfulness**: Breathing exercises and relaxation prompts
- **Gamification**: Achievement badges, daily streaks, and progress celebrations

### 🐾 Studentopia Companion
- **25 Adorable Animal Companions** - Choose from a wide variety of friendly companions:
  - **Available Animals**: Cat, Red Panda, Owl, Penguin, Horse, Dog, Chick, Bear, Hedgehog, Tiger, Turtle, Bunny, Giraffe, Lamb, Alpaca, Lion, Frog, Koala, Sloth, Monkey, Hamster, Reindeer, Chipmunk, Elephant, and Goldfish
- **Static Friendly Images** - Clean, non-distracting static images keep you focused on your studies
- **App-Wide Integration** - Your Studentopia Companion appears throughout the app:
  - 📖 **Motivational Quotes** - Companion appears alongside daily inspiration
  - 💡 **Study Tips** - Your companion guides you through helpful study techniques
  - ⏱️ **Timer Sessions** - Your companion supports you during focus and break times
  - ✅ **Task Management** - Companion appears in task views to encourage productivity
  - 🎉 **Celebrations** - Special celebration display when you complete tasks
- **Customization** - Name your companion and choose from 25 different animals
- **Consistent Design** - Same friendly, kawaii-style circular design across all screens
- **Motivational Presence** - Your companion creates continuity and engagement as you navigate the app

### 🌍 Multilingual Support
- **14 Languages**: English, Spanish, French, German, Chinese (Simplified), Japanese, Arabic, Korean, Portuguese (Brazilian), Hindi, Italian, Turkish, Russian, Indonesian
- **Instant Language Switching**: Change language in Profile settings
- **Full Translation Coverage**: All UI text, labels, and messages translated
- **Native Character Support**: Proper display for CJK, Devanagari, Cyrillic, and Arabic scripts
- **RTL Support**: Right-to-left layout for Arabic
- **Cultural Sensitivity**: Translations maintain friendly, motivating tone across all languages
- **See**: `MULTILINGUAL_GUIDE.md` for complete documentation

### 🎨 Customization & Themes
- **10 Dynamic Theme Colors**: Nature, Ocean, Sunset, Galaxy, Rainbow, Forest, Desert, Arctic, Autumn, Cherry Blossom
- **Personalization**: Custom username, Study Pal name and animal (20 choices!)
- **Notifications**: Toggle push notifications on/off
- **Animation Settings**: Enable or disable mascot animations

## Tech Stack

- **Framework**: React Native 0.76.7 with Expo SDK 53
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Animations**: React Native Reanimated v3
- **AI Integration**: OpenAI GPT-4 (Chat & Grammar Checking)
- **UI Components**: Expo Vector Icons, Linear Gradient
- **Date Handling**: date-fns

## Project Structure

```
src/
├── api/
│   ├── anthropic.ts           # Anthropic AI client
│   ├── openai.ts              # OpenAI client
│   ├── grok.ts                # Grok AI client
│   ├── chat-service.ts        # AI chat service wrapper
│   ├── transcribe-audio.ts    # Audio transcription
│   └── image-generation.ts    # Image generation
├── components/
│   ├── StudyPal.tsx           # Animated mascot component
│   └── CustomAlert.tsx        # Custom alert modal component
├── navigation/
│   └── BottomTabNavigator.tsx # Main app navigation
├── screens/
│   ├── OnboardingScreen.tsx   # Initial setup flow
│   ├── HomeScreen.tsx         # Dashboard with stats & quotes
│   ├── TasksScreen.tsx        # Task management
│   ├── CalendarScreen.tsx     # Calendar view
│   ├── TimerScreen.tsx        # Study/break timer with music
│   ├── AIHelperScreen.tsx     # AI chatbot
│   └── ProfileScreen.tsx      # Settings & customization
├── state/
│   ├── userStore.ts           # User preferences & settings
│   ├── taskStore.ts           # Task data management
│   ├── statsStore.ts          # User statistics
│   ├── timerStore.ts          # Centralized timer state
│   └── groupStore.ts          # Groups & collaboration
├── services/
│   ├── musicService.ts        # Music playback service
│   ├── notificationService.ts # Push notifications
│   └── calendarService.ts     # Calendar integration
├── types/
│   ├── index.ts               # TypeScript type definitions
│   └── ai.ts                  # AI-related types
└── utils/
    ├── cn.ts                  # Tailwind class merger
    ├── translations.ts        # Multi-language translations
    ├── themes.ts              # Theme configurations
    ├── engagementMessages.ts  # Time-based greetings and task reminders
    └── content.ts             # Motivational quotes & tips
```

## Key Features Implementation

### State Management
The app uses Zustand with AsyncStorage for persistent state:
- **User Store**: Language, theme, Study Pal config, notifications
- **Task Store**: All tasks with CRUD operations and filtering
- **Stats Store**: Achievements, streaks, study time tracking
- **Timer Store**: Centralized timer state with synchronized intervals
- **Group Store**: Group creation, joining, search, and management

### Multi-language Support
All UI text is translated through the `useTranslation` hook. Currently supports:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Arabic (ar)

To add a new language, update `src/utils/translations.ts`.

### AI Integration
- Uses OpenAI GPT-4 for chat and grammar checking
- System prompts customized for each mode
- Responds in user's selected language
- Error handling with fallback messages

### Animations
Study Pal mascots use React Native Reanimated for smooth animations:
- Timing-based animations with easing
- Looping sequences for continuous movement
- Can be toggled on/off in settings

## Customization

### Adding New Animals
1. Add the animal type to `StudyPalAnimal` in `src/types/index.ts`
2. Add emoji and translation in `src/utils/translations.ts`
3. Add animation logic in `src/components/StudyPal.tsx`

### Adding New Theme Colors
1. Add color to `ThemeColor` type in `src/types/index.ts`
2. Add gradient colors to theme arrays in screens
3. Update translation keys if needed

### Adding New Languages
1. Add language code to `Language` type
2. Add full translation object in `src/utils/translations.ts`
3. Add quotes and tips in that language in `src/utils/content.ts`

## Future Enhancements

### Planned Features
- **Enhanced Group Features**: Group chat, member management, and teacher assignment features
- **Push Notifications**: Task reminders with custom alarm sounds
- **Mindfulness Breaks**: Guided breathing exercises and meditation timer
- **Resource Library**: Video and article suggestions from AI
- **Offline Mode**: Full functionality without internet
- **Data Export**: Export tasks and stats to CSV/PDF
- **Widgets**: Home screen widgets for quick task view
- **Dark Mode**: Full dark theme support (partial implementation)
- **Voice Commands**: Add tasks and control timer with voice
- **Study Analytics**: Detailed charts showing productivity patterns

## Development Notes

### Environment Variables
API keys are pre-configured in the Vibecode environment:
- `process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY`
- `process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY`

### Best Practices
- Use double quotes for strings with apostrophes
- Avoid native alerts; use CustomAlert component instead
- All user-facing text should use `t()` translation function
- Use Pressable instead of TouchableOpacity
- Dismiss keyboard on scroll/tap outside input
- Use individual Zustand selectors to prevent unnecessary re-renders

### Performance
- Individual Zustand selectors to avoid re-renders
- Memoized calculations for progress bars
- Optimized FlatList/ScrollView rendering
- AsyncStorage for fast local data persistence

## Troubleshooting

### Blank Screens Issue
If you see blank/white screens on tabs:
1. **Close and reopen the app** - The app will automatically detect invalid user data and show onboarding
2. **Check the Profile tab** - If visible, look for the "Set Up Profile" button
3. **View logs** - Check the LOGS tab in Vibecode or `expo.log` file for debug information

**See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.**

### Settings Not Visible
Settings is not a separate tab - it's a modal:
1. Go to **Profile** tab
2. Tap the **gear icon (⚙️)** in the top-right corner
3. Settings modal opens with notification and calendar options

### Common Issues
- **App shows onboarding repeatedly**: User data not saving - check AsyncStorage permissions
- **Some translations missing**: Check `src/utils/translations.ts` for the key
- **Study Pal not animating**: Toggle animations in Profile → Study Pal section
- **Music not playing**: Check device volume and audio permissions

## Getting Started

The app runs automatically on Expo. No additional setup required.

## User Flow

1. **Onboarding**: Set username, name Study Pal, choose animal and theme
2. **Home**: View daily progress, motivational quote, and study tip
3. **Tasks**: Add and manage tasks with categories and due dates
4. **Calendar**: Visualize tasks on calendar, tap to view by date
5. **Timer**: Run study sessions with customizable durations and background music
6. **AI Helper**: Ask questions or check grammar
7. **Profile**: Customize settings and manage preferences

## Credits

Built for students by AI, powered by:
- Vibecode (mobile app platform)
- OpenAI (AI assistance)
- Expo (React Native framework)
- React Native community packages

---

**Made with ❤️ for students everywhere**
