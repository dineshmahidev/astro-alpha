import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/contexts/auth-context';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="consumer" />
          <Stack.Screen name="astrologer" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="palm-reading" />
          <Stack.Screen name="topup" />
          <Stack.Screen name="astrologers-market" />
          <Stack.Screen name="astrologer-portfolio" />
          <Stack.Screen name="zodiac" />
          <Stack.Screen name="zodiac/[id]" />
          <Stack.Screen name="ai-specialist/[id]" />
          <Stack.Screen name="chat-room/[id]" />
          <Stack.Screen name="kundli" />
          <Stack.Screen name="match" />
          <Stack.Screen name="match-result" />
          <Stack.Screen name="tarot" />
          <Stack.Screen name="astrologer-sessions" />
          <Stack.Screen name="astrologer-payments" />
          <Stack.Screen name="astrologer-support" />
          <Stack.Screen name="astrologer-edit-portfolio" />
          <Stack.Screen name="astrologer-kundli" />
          <Stack.Screen name="astrologer-notifications" />
          <Stack.Screen name="astrologer-match" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}