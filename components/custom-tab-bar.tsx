import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const GOLD = '#97743B';

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, [IconName, IconName]> = {
  index: ['home', 'home-outline'],
  chat: ['chatbubble', 'chatbubble-outline'],
  astrologer: ['grid', 'grid-outline'],
  'astrologer-payments': ['wallet', 'wallet-outline'],
  palms: ['hand-left', 'hand-left-outline'],
  account: ['person', 'person-outline'],
};

const { width: SCREEN_W } = Dimensions.get('window');
const W = SCREEN_W - 32;
const H = 66;
const R = 20;

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const path = [
    `M ${R} 0`,
    `H ${W - R}`,
    `A ${R} ${R} 0 0 1 ${W} ${R}`,
    `V ${H - R}`,
    `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
    `H ${R}`,
    `A ${R} ${R} 0 0 1 0 ${H - R}`,
    `V ${R}`,
    `A ${R} ${R} 0 0 1 ${R} 0`,
    'Z',
  ].join(' ');

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 8 }]}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={path} fill="#1D1D1C" />
      </Svg>
      <View style={styles.items}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const icons = ICONS[route.name];
          if (!icons) return null;
          const icon = icons[focused ? 0 : 1];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              onPress={onPress}
              activeOpacity={0.7}>
              <Ionicons
                name={icon}
                size={focused ? 24 : 22}
                color={focused ? GOLD : '#7E7E78'}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  items: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    color: '#7E7E78',
  },
  labelActive: {
    color: GOLD,
    fontWeight: '600',
  },
});
