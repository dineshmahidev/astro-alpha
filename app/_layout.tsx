import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/contexts/auth-context';

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="zodiac" />
          <Stack.Screen name="zodiac/[id]" />
          <Stack.Screen name="ai/index" />
          <Stack.Screen name="ai/[id]" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="astrologer/[id]" />
          <Stack.Screen name="kundli" />
          <Stack.Screen name="horoscope" />
          <Stack.Screen name="match" />
          <Stack.Screen name="tarot" />
        </Stack>
        <StatusBar style="light" backgroundColor="#121212" />
      </ThemeProvider>
    </AuthProvider>
  );
}