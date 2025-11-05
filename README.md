# StudyPal - Your Personal Study Companion

StudyPal is a comprehensive mobile productivity app designed for students to stay organized, complete tasks, maintain focus, and promote wellness. Built with React Native and Expo, it features a colorful, playful, and highly customizable interface with **20 animated animal companions** and **10 dynamic themes**.

## ✨ Latest Updates

- ✅ **Enhanced Timer Features** - Custom time input, alarm sound selection, and color-coded backgrounds (green for study, blue for breaks)
- ✅ **Custom Duration Input** - Directly type any study/break duration (1-120 minutes) with dedicated modal
- ✅ **Alarm Sound Options** - Choose from 4 different alarm sounds (Bell, Chime, Beep, Gentle) to play when timer completes
- ✅ **Color-Coded Backgrounds** - Study sessions show green background, break sessions show blue background for clear visual distinction
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
- ✅ **20 Animal Companions** - Choose from cat, bunny, bear, dog, fox, panda, koala, owl, penguin, lion, tiger, monkey, elephant, giraffe, hamster, raccoon, hedgehog, deer, duck, or frog
- ✅ **Celebration Animations** - Animated celebration modal with your Study Pal when you complete tasks
- ✅ **10 Dynamic Themes** - Blue, Purple, Pink, Green, Orange, Red, Teal, Indigo, Rose, and Amber
- ✅ **Mood-Based Animations** - Study Pal changes mood (happy, focused, celebrating, relaxed) based on your progress
- ✅ **Improved Timer Display** - Fixed font size for better readability

## Features

### 📝 Core Task Management
- **Task CRUD Operations**: Add, edit, delete, and complete tasks
- **Task Categories**: Homework, projects, exams, and other custom categories
- **Due Dates & Times**: Set both date and time for precise task scheduling
- **Reminders**: Custom reminder notifications with date and time
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

### 🐾 Study Pal Companion
- **20 Animated Mascots**: Choose from a wide variety of kawaii animals:
  - **Original 6**: Cat, Bunny, Bear, Dog, Fox, Panda
  - **New 14**: Koala, Owl, Penguin, Lion, Tiger, Monkey, Elephant, Giraffe, Hamster, Raccoon, Hedgehog, Deer, Duck, Frog
- **Unique Animations** - Each animal has its own personality:
  - Cat: Blinking animation
  - Bunny: Hopping animation
  - Bear: Waving animation
  - Dog: Tail wagging animation
  - Fox: Head tilting animation
  - Panda: Gentle bobbing animation
  - Koala: Slow swaying
  - Owl: Head rotation
  - Penguin: Waddle rock
  - Lion: Proud breathing
  - Tiger: Pouncing motion
  - Monkey: Double bounce
  - Elephant: Trunk sway
  - Giraffe: Neck stretch
  - Hamster: Quick twitching
  - Raccoon: Curious blink
  - Hedgehog: Gentle bobbing
  - Deer: Light jump
  - Duck: Side-to-side waddle
  - Frog: High hop
- **Mood States**: Study Pal shows different moods based on your progress:
  - 😊 **Happy**: Default cheerful state
  - 🎯 **Focused**: During study sessions
  - 🎉 **Celebrating**: When you complete tasks (special animation!)
  - 😌 **Relaxed**: During break times
- **Customization**: Name your Study Pal and toggle animations on/off
- **Motivational Messages**: Your Study Pal appears with encouragement throughout the app

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
