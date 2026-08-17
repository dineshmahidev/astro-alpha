import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const ACCENT = '#B09C66';

type IconName = keyof typeof Ionicons.glyphMap;

const MENU_ITEMS: { icon: IconName; label: string }[] = [
  { icon: 'document-text', label: 'My Kundli' },
  { icon: 'time', label: 'Order History' },
  { icon: 'heart', label: 'Favourites' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'help-circle', label: 'Help & Support' },
  { icon: 'log-out', label: 'Logout' },
];

export default function AccountScreen() {
  const router = useRouter();

  const onPress = (label: string) => {
    switch (label) {
      case 'My Kundli':
        router.push('/kundli');
        return;
      case 'Logout':
        router.replace('/login');
        return;
      default:
        Alert.alert(label, `${label} is coming soon.`);
    }
  };
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.name}>Rahul Sharma</ThemedText>
              <ThemedText style={styles.email}>rahul@example.com</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => Alert.alert('Edit Profile')}>
              <Ionicons name="create-outline" size={20} color={ACCENT} />
            </TouchableOpacity>
          </View>

          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Ionicons name="wallet" size={22} color="#ffffff" />
              <ThemedText style={styles.walletLabel}>My Wallet</ThemedText>
            </View>
            <ThemedText style={styles.walletBalance}>₹ 1,250.00</ThemedText>
            <TouchableOpacity
              style={styles.addMoneyBtn}
              onPress={() => Alert.alert('Add Money')}>
              <Ionicons name="add" size={18} color="#ffffff" />
              <ThemedText style={styles.addMoneyText}>Add Money</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => onPress(item.label)}
                style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && styles.menuItemBorder]}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={ACCENT} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color="#7E7E78" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  content: { padding: 16, paddingTop: 24, paddingBottom: 110 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, marginLeft: 14 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  email: { fontSize: 13, color: '#7E7E78', marginTop: 2 },
  editBtn: { padding: 8 },
  walletCard: {
    backgroundColor: '#97743B',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletLabel: { color: '#ffffff', fontSize: 15 },
  walletBalance: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 12,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#B09C66',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  addMoneyText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  menuCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#292723',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 15, color: '#EEEDE0' },
});
