import { Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/components/custom-tab-bar';
import { isAstrologer, useAuth } from '@/contexts/auth-context';

const USER_TABS = [
  ['index', 'Home'],
  ['chat', 'Chat'],
  ['astrologer', 'Astrologer'],
  ['palms', 'Palm Reading'],
  ['account', 'Account'],
] as [string, string][];

const ASTROLOGER_TABS = [
  ['astrologer', 'Dashboard'],
  ['chat', 'Chats'],
  ['astrologer-payments', 'Earnings'],
  ['account', 'Account'],
] as [string, string][];

export default function TabLayout() {
  const { role } = useAuth();
  const isAstro = isAstrologer(role);
  const tabs = isAstro ? ASTROLOGER_TABS : USER_TABS;

  return (
    <Tabs
      initialRouteName={isAstro ? 'astrologer' : 'index'}
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {tabs.map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
      {!isAstro && (
        <Tabs.Screen name="astrologer-payments" options={{ href: false }} />
      )}
    </Tabs>
  );
}
