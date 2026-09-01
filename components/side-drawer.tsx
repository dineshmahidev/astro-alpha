import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/avatar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const DRAWER_W = width * 0.72;
const ACCENT = '#B09C66';
const DARK = '#1D1D1C';
const CARD_BG = '#F5F5F5';

type Props = {
  open: boolean;
  onClose: () => void;
};

const MENU_ITEMS = [
  { icon: 'home' as const, label: 'Home', route: '/consumer' },
  { icon: 'chatbubble' as const, label: 'Chat with Astrologer', route: '/consumer' },
  { icon: 'call' as const, label: 'Call Astrologer', route: '/consumer' },
  { icon: 'document-text' as const, label: 'Kundli', route: '/kundli' },
  { icon: 'heart' as const, label: 'Match Making', route: '/match' },
  { icon: 'hand-left' as const, label: 'Palm Reading', route: '/palms' },
  { icon: 'star' as const, label: 'Tarot', route: '/tarot' },
  { icon: 'planet' as const, label: 'Horoscope', route: '/horoscope' },
];

export default function SideDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: open ? 0 : -DRAWER_W,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }),
      Animated.timing(fadeAnim, {
        toValue: open ? 0.5 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open]);

  const handlePress = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 200);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      signOut().then(() => router.replace('/login'));
    }, 200);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={s.header}>
          <Avatar uri="" name={user?.name ?? 'U'} size={48} color={ACCENT} />
          <View style={s.headerInfo}>
            <ThemedText style={s.userName}>{user?.name ?? 'User'}</ThemedText>
            <ThemedText style={s.userEmail}>{user?.email ?? ''}</ThemedText>
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#888888" />
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        {/* Menu Items */}
        <View style={s.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.menuItem}
              onPress={() => handlePress(item.route)}>
              <View style={s.menuIcon}>
                <Ionicons name={item.icon} size={20} color={ACCENT} />
              </View>
              <ThemedText style={s.menuLabel}>{item.label}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#AAAAAA" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.divider} />

        {/* Logout */}
        <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
          <View style={[s.menuIcon, { backgroundColor: 'rgba(229,115,115,0.12)' }]}>
            <Ionicons name="log-out" size={20} color="#E57373" />
          </View>
          <ThemedText style={[s.menuLabel, { color: '#E57373' }]}>Logout</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 30,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', color: DARK },
  userEmail: { fontSize: 12, color: '#888888' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
    marginHorizontal: 20,
  },

  menuList: { gap: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: DARK },
});
