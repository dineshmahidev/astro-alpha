import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const ACCENT = '#B09C66';
const GOLD = '#97743B';

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, [IconName, IconName]> = {
  index: ['home', 'home-outline'],
  chat: ['chatbubble', 'chatbubble-outline'],
  astrologer: ['star', 'star-outline'],
  palms: ['hand-left', 'hand-left-outline'],
  account: ['person', 'person-outline'],
};

const { width: SCREEN_W } = Dimensions.get('window');
const W = SCREEN_W - 32;
const H = 66;
const R = 20;
const BUMP_R = 32;

const CENTER = Math.floor(5 / 2);

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const path = [
    `M ${R} 0`,
    `H ${W / 2 - BUMP_R}`,
    `A ${BUMP_R} ${BUMP_R} 0 0 1 ${W / 2 + BUMP_R} 0`,
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
          const icon = ICONS[route.name][focused ? 0 : 1];

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

          if (index === CENTER) {
            return (
              <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.8}>
                <View style={[styles.raisedBtn, focused && styles.raisedBtnActive]}>
                  <Ionicons name={icon} size={28} color="#ffffff" />
                </View>
                <Text style={styles.label}>{options.title}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.8}>
              <Ionicons name={icon} size={focused ? 26 : 23} color={focused ? GOLD : '#7E7E78'} />
              <Text style={[styles.label, focused && styles.labelActive]}>{options.title}</Text>
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
    alignItems: 'flex-end',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 3,
  },
  raisedBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#121212',
    marginTop: -30,
    marginBottom: 4,
  },
  raisedBtnActive: {
    backgroundColor: '#B09C66',
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
