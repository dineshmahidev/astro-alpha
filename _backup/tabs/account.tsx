import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/avatar';
import { useAstrologers } from '@/hooks/use-astrologers';
import { isAstrologer, useAuth } from '@/contexts/auth-context';
import { listAstrologerPayments, type Payment } from '@/lib/chat';

const ACCENT = '#B09C66';
const GOLD = '#97743B';
const GREEN = '#7BD88F';
const RED = '#E57373';
const CARD_BG = 'rgba(29,29,28,0.7)';
const BORDER = 'rgba(176,156,102,0.35)';

type IconName = keyof typeof Ionicons.glyphMap;

const MENU: { icon: IconName; label: string; color?: string }[] = [
  { icon: 'person', label: 'Edit Profile' },
  { icon: 'wallet', label: 'Earnings' },
  { icon: 'time', label: 'Availability' },
  { icon: 'notifications', label: 'Notifications' },
  { icon: 'shield-checkmark', label: 'Privacy & Security' },
  { icon: 'document-text', label: 'Terms of Service' },
  { icon: 'help-circle', label: 'Help & Support' },
  { icon: 'log-out', label: 'Logout', color: RED },
];

export default function AccountScreen() {
  const router = useRouter();
  const { role, user, signOut } = useAuth();
  const { astrologers } = useAstrologers();
  const [notifications, setNotifications] = useState(true);
  const [available, setAvailable] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const myAstro = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [astrologers, user?.email],
  );

  useEffect(() => {
    if (!myAstro?.id) return;
    listAstrologerPayments(myAstro.id).then(setPayments);
  }, [myAstro?.id]);

  const totalEarnings = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleMenu = (label: string) => {
    switch (label) {
      case 'Edit Profile':
        router.push('/edit-profile');
        break;
      case 'Earnings':
        router.push('/astrologer-payments');
        break;
      case 'Logout':
        signOut().then(() => router.replace('/login'));
        break;
    }
  };

  return (
    <ThemedView style={s.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Profile Card */}
          <View style={s.profileCard}>
            <View style={s.profileTop}>
              <Avatar uri={myAstro?.avatar ?? ''} name={user?.name ?? 'A'} size={64} color={ACCENT} />
              <View style={s.profileInfo}>
                <ThemedText style={s.profileName}>{user?.name ?? 'Astrologer'}</ThemedText>
                <ThemedText style={s.profileEmail}>{user?.email ?? ''}</ThemedText>
                <ThemedText style={s.profileSpecialty}>{myAstro?.specialty ?? 'Vedic Astrology'}</ThemedText>
              </View>
            </View>
            <View style={s.profileStats}>
              <View style={s.profileStat}>
                <ThemedText style={s.profileStatValue}>{myAstro?.rating ?? '0'}</ThemedText>
                <ThemedText style={s.profileStatLabel}>Rating</ThemedText>
              </View>
              <View style={s.profileStatDivider} />
              <View style={s.profileStat}>
                <ThemedText style={s.profileStatValue}>{payments.length}</ThemedText>
                <ThemedText style={s.profileStatLabel}>Sessions</ThemedText>
              </View>
              <View style={s.profileStatDivider} />
              <View style={s.profileStat}>
                <ThemedText style={[s.profileStatValue, { color: GREEN }]}>₹{totalEarnings}</ThemedText>
                <ThemedText style={s.profileStatLabel}>Earned</ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Toggles */}
          <View style={s.toggleCard}>
            <View style={s.toggleRow}>
              <View style={s.toggleLeft}>
                <Ionicons name="radio" size={18} color={available ? GREEN : '#7E7E78'} />
                <ThemedText style={s.toggleLabel}>Available for chats</ThemedText>
              </View>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: '#3A3A3A', true: 'rgba(123,216,143,0.3)' }}
                thumbColor={available ? GREEN : '#7E7E78'}
              />
            </View>
            <View style={s.toggleDivider} />
            <View style={s.toggleRow}>
              <View style={s.toggleLeft}>
                <Ionicons name="notifications" size={18} color={notifications ? ACCENT : '#7E7E78'} />
                <ThemedText style={s.toggleLabel}>Push notifications</ThemedText>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#3A3A3A', true: 'rgba(176,156,102,0.3)' }}
                thumbColor={notifications ? ACCENT : '#7E7E78'}
              />
            </View>
          </View>

          {/* Menu */}
          <View style={s.menuCard}>
            {MENU.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[s.menuItem, i < MENU.length - 1 && s.menuDivider]}
                activeOpacity={0.6}
                onPress={() => handleMenu(item.label)}>
                <View style={s.menuLeft}>
                  <Ionicons name={item.icon} size={20} color={item.color ?? '#7E7E78'} />
                  <ThemedText style={[s.menuLabel, item.color && { color: item.color }]}>
                    {item.label}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#5A5A54" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Version */}
          <ThemedText style={s.version}>Koshmira v1.0.0</ThemedText>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },

  // Profile
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  profileEmail: { fontSize: 12, color: '#7E7E78' },
  profileSpecialty: { fontSize: 12, color: ACCENT, marginTop: 2 },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  profileStat: { flex: 1, alignItems: 'center', gap: 4 },
  profileStatValue: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  profileStatLabel: { fontSize: 11, color: '#7E7E78', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileStatDivider: { width: 1, height: 30, backgroundColor: BORDER },

  // Toggles
  toggleCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 14, color: '#EEEDE0' },
  toggleDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 14 },

  // Menu
  menuCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(176,156,102,0.12)' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 14, color: '#EEEDE0' },

  // Version
  version: { fontSize: 12, color: '#5A5A54', textAlign: 'center', marginTop: 20 },
});
