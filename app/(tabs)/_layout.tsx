import { Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {(
        [
          ['index', 'Home'],
          ['chat', 'Chat'],
          ['astrologer', 'Astrologer'],
          ['palms', 'Palm Reading'],
          ['account', 'Account'],
        ] as [string, string][]
      ).map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
    </Tabs>
  );
}
