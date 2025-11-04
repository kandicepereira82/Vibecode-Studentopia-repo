import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import { getTheme } from "../utils/themes";
import { useTranslation } from "../utils/translations";

interface StudyTip {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tips: string[];
}

const StudyTipsScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");

  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const studyTips: StudyTip[] = [
    {
      id: "focused-diffuse",
      category: "Learning Modes",
      title: "Focused & Diffuse Thinking",
      description: "Your brain has two modes of thinking that work together for effective learning",
      icon: "bulb",
      tips: [
        "Focused Mode: Use intense concentration for solving problems and learning new concepts",
        "Diffuse Mode: Let your mind wander during breaks - this helps connect ideas in the background",
        "Alternate between both modes: Study intensely, then take breaks to let ideas consolidate",
        "When stuck on a problem, step away and do something different - solutions often appear during diffuse mode"
      ]
    },
    {
      id: "chunking",
      category: "Memory Techniques",
      title: "Chunking Information",
      description: "Break down complex information into smaller, manageable pieces",
      icon: "grid",
      tips: [
        "Group related concepts together into meaningful chunks",
        "Practice recalling chunks without looking at notes",
        "Connect new chunks to previously learned material",
        "Build up from simple chunks to more complex understanding",
        "Use analogies and metaphors to make chunks more memorable"
      ]
    },
    {
      id: "recall",
      category: "Active Learning",
      title: "Practice Recall",
      description: "Testing yourself is more effective than re-reading",
      icon: "refresh",
      tips: [
        "Close your book and try to recall what you just learned",
        "Test yourself frequently with flashcards or practice questions",
        "Explain concepts out loud as if teaching someone else",
        "Use the Feynman Technique: explain in simple terms",
        "Recall strengthens neural pathways better than passive review"
      ]
    },
    {
      id: "spaced-repetition",
      category: "Memory Retention",
      title: "Spaced Repetition",
      description: "Review material at increasing intervals for long-term retention",
      icon: "calendar",
      tips: [
        "Review new material within 24 hours of learning it",
        "Space out review sessions: Day 1, Day 3, Day 7, Day 14, Day 30",
        "Use apps or flashcards that implement spaced repetition algorithms",
        "Don't cram - distributed practice beats massed practice",
        "Each review session should be brief but regular"
      ]
    },
    {
      id: "procrastination",
      category: "Productivity",
      title: "Overcoming Procrastination",
      description: "Use the Pomodoro Technique and manage your attention",
      icon: "time",
      tips: [
        "Use 25-minute focused work sessions (Pomodoros) with 5-minute breaks",
        "Focus on process, not product: commit to working for a set time, not finishing",
        "Remove distractions before starting: phone away, notifications off",
        "Reward yourself after completing study sessions",
        "The hardest part is starting - just commit to 5 minutes"
      ]
    },
    {
      id: "interleaving",
      category: "Practice Strategy",
      title: "Interleaving & Variety",
      description: "Mix different types of problems and subjects during practice",
      icon: "shuffle",
      tips: [
        "Don't practice the same type of problem repeatedly",
        "Mix up different problem types in one study session",
        "Study multiple subjects in one day rather than blocking by subject",
        "Interleaving helps you learn when to apply different techniques",
        "It feels harder but leads to better long-term learning"
      ]
    },
    {
      id: "sleep",
      category: "Brain Health",
      title: "Sleep & Memory",
      description: "Sleep is crucial for memory consolidation and learning",
      icon: "moon",
      tips: [
        "Get 7-9 hours of sleep per night for optimal learning",
        "Review difficult material before sleep - your brain processes it overnight",
        "Don't pull all-nighters - sleep deprivation impairs learning ability",
        "Take short naps (20-30 mins) to refresh your focused mode",
        "During sleep, your brain strengthens important neural connections"
      ]
    },
    {
      id: "exercise",
      category: "Brain Health",
      title: "Exercise & Learning",
      description: "Physical activity enhances cognitive function and memory",
      icon: "fitness",
      tips: [
        "Exercise increases blood flow to the brain and promotes neuron growth",
        "Even a short walk can help when you feel mentally stuck",
        "Regular exercise improves focus, memory, and mental clarity",
        "Exercise before studying can prepare your brain for learning",
        "Movement breaks during study sessions refresh your attention"
      ]
    },
    {
      id: "metaphor",
      category: "Understanding",
      title: "Metaphors & Analogies",
      description: "Use comparisons to understand difficult concepts",
      icon: "git-compare",
      tips: [
        "Create visual or physical metaphors for abstract concepts",
        "Compare new ideas to things you already understand well",
        "Draw diagrams and mind maps to visualize relationships",
        "Use stories and real-world examples to anchor learning",
        "The brain remembers concrete images better than abstract concepts"
      ]
    },
    {
      id: "deliberate-practice",
      category: "Mastery",
      title: "Deliberate Practice",
      description: "Focus on your weakest areas for maximum improvement",
      icon: "trophy",
      tips: [
        "Identify your weak spots and practice them specifically",
        "Work on problems just beyond your current ability level",
        "Don't just do what you're already good at - challenge yourself",
        "Get feedback on your practice to identify areas for improvement",
        "Embrace mistakes as learning opportunities, not failures"
      ]
    },
    {
      id: "test-prep",
      category: "Exam Strategy",
      title: "Test Preparation",
      description: "Strategic approaches for exam success",
      icon: "school",
      tips: [
        "Practice with past exams and sample questions under timed conditions",
        "Start with hard problems first when your mind is fresh",
        "If stuck, move on and return later - let your diffuse mode work",
        "Check your work by working backwards or using different methods",
        "Reduce test anxiety through adequate preparation and practice tests"
      ]
    },
    {
      id: "learning-mindset",
      category: "Mindset",
      title: "Growth Mindset",
      description: "Your brain is like a muscle - it grows stronger with practice",
      icon: "trending-up",
      tips: [
        "Intelligence is not fixed - you can become smarter through effort",
        "Mistakes and struggle are part of the learning process",
        "Praise effort and strategies, not just results",
        "View challenges as opportunities to grow, not threats",
        "Believe in your ability to learn difficult material with proper technique"
      ]
    }
  ];

  const toggleTip = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView className="flex-1">
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary
          }}>
            Study Tips
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: 'Poppins_400Regular',
            color: theme.textSecondary,
            marginTop: 4
          }}>
            Evidence-based learning strategies
          </Text>
        </View>

        {/* Tips List */}
        <ScrollView className="flex-1 px-6 py-2" showsVerticalScrollIndicator={false}>
          {studyTips.map((tip, index) => (
            <Pressable
              key={tip.id}
              onPress={() => toggleTip(tip.id)}
              className="mb-3 rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.cardBackground }}
            >
              {/* Tip Header */}
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: theme.primary + "20" }}
                    >
                      <Ionicons name={tip.icon} size={24} color={theme.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-medium mb-1" style={{ color: theme.secondary }}>
                        {tip.category}
                      </Text>
                      <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                        {tip.title}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expandedTip === tip.id ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.textSecondary}
                  />
                </View>

                <Text className="text-sm mt-2 mb-1" style={{ color: theme.textSecondary }}>
                  {tip.description}
                </Text>
              </View>

              {/* Expanded Content */}
              {expandedTip === tip.id && (
                <View className="px-4 pb-4 pt-2" style={{ borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
                  {tip.tips.map((tipText, idx) => (
                    <View key={idx} className="flex-row mb-3">
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                        style={{ backgroundColor: theme.secondary + "30" }}
                      >
                        <Text className="text-xs font-bold" style={{ color: theme.secondary }}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-sm leading-5" style={{ color: theme.textPrimary }}>
                        {tipText}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          ))}

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default StudyTipsScreen;
