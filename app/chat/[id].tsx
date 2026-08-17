import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ASTROLOGERS } from '@/constants/astrologers';

const ACCENT = '#B09C66';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const astro = ASTROLOGERS.find((a) => a.id === id);

  const call = () => {
    const digits = (astro?.mobile ?? '').replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${digits}`);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/astrologer/[id]', params: { id: astro?.id ?? '' } })
            }>
            <Image source={{ uri: astro?.avatar }} style={styles.headerAvatar} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerName}>{astro?.name ?? 'Astrologer'}</ThemedText>
            <TouchableOpacity onPress={call} style={styles.mobileRow}>
              <Ionicons name="call" size={14} color={ACCENT} />
              <ThemedText style={styles.mobileText}>{astro?.mobile ?? ''}</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={call} style={styles.callBtn}>
            <Ionicons name="call" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.messages}>
          <View style={styles.msgIn}>
            <ThemedText style={styles.msgInText}>Namaste {astro?.name}. I need guidance.</ThemedText>
          </View>
          <View style={styles.msgOut}>
            <ThemedText style={styles.msgOutText}>
              Greetings! Please share your birth details.
            </ThemedText>
          </View>
        </View>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#7E7E78"
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  backBtn: { padding: 8 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#292723',
    marginLeft: 4,
  },
  headerInfo: { flex: 1, marginLeft: 8 },
  headerName: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0' },
  mobileRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  mobileText: { fontSize: 13, color: ACCENT },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: { flex: 1, padding: 16, gap: 12 },
  msgIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#292723',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '80%',
  },
  msgInText: { color: '#EEEDE0' },
  msgOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#97743B',
    borderRadius: 14,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
  },
  msgOutText: { color: '#ffffff' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444039',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#EEEDE0',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
