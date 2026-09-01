import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { Avatar } from '@/components/avatar';
import type { Astrologer } from '@/constants/astrologers';
import { supabase } from '@/lib/supabase';

const ACCENT = '#B09C66';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [astro, setAstro] = useState<Astrologer | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('astrologers').select('*').eq('id', id).single();
      if (data) setAstro(data as Astrologer);
    })();
  }, [id]);

  const call = () => {
    const digits = (astro?.mobile ?? '').replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${digits}`);
  };

  return (
    <ThemedView style={styles.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
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
            <Avatar uri={astro?.avatar} name={astro?.name ?? 'A'} size={40} color={astro?.avatarColor} style={{ marginLeft: 4 }} />
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
    borderBottomColor: 'rgba(68,64,57,0.4)',
  },
  backBtn: { padding: 8 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(41,39,35,0.6)',
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
    shadowColor: ACCENT,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  messages: { flex: 1, padding: 16, gap: 12 },
  msgIn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(41,39,35,0.6)',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '80%',
  },
  msgInText: { color: '#EEEDE0' },
  msgOut: {
    alignSelf: 'flex-end',
    backgroundColor: ACCENT,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
    shadowColor: ACCENT,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  msgOutText: { color: '#ffffff' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(68,64,57,0.4)',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(41,39,35,0.6)',
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
    shadowColor: ACCENT,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
