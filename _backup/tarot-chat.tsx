import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const ACCENT = '#B09C66';
const GOLD = '#C9BE98';

export default function TarotChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cards?: string; combo?: string }>();
  const cards = (() => {
    try {
      const parsed = JSON.parse(params.cards ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })() as { name: string; meaning: string; imageKey?: string }[];

  const combo = params.combo ?? '';

  const [messages, setMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    {
      from: 'ai',
      text:
        cards.length === 3
          ? `Your reading drew ${cards.map((c) => c.name).join(', ')}. Ask me anything about what these cards mean for you.`
          : 'Ask me about your tarot reading.',
    },
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('tarot-chat').then((saved) => {
      if (!active) return;
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          // ignore corrupt storage
        }
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('tarot-chat', JSON.stringify(messages)).catch(() => {});
  }, [messages, loaded]);

  const send = async () => {
    if (!text.trim() || typing) return;
    const question = text.trim();
    setMessages((m) => [...m, { from: 'user', text: question }]);
    setText('');
    setTyping(true);
    try {
      const cardContext = cards
        .map((c) => `${c.name}: ${c.meaning}`)
        .join(' | ');
      const systemPrompt = [
        `You are a warm, mystical tarot reader in a premium Vedic astrology app.`,
        `Always reply in a warm, mystical, and spiritual tone, in simple English.`,
        `The user just drew these 3 tarot cards: ${cardContext || 'none'}`,
        `Combined reading: ${combo}`,
        `Interpret their question in the context of these specific cards, not generic advice.`,
        `Keep answers concise (3-5 short sentences). Ask one follow-up question when relevant.`,
      ].join(' ');
      const history = messages
        .filter((m) => !m.text.startsWith('Your reading drew'))
        .map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));
      const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'big-pickle',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: question },
          ],
        }),
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      setMessages((m) => [
        ...m,
        { from: 'ai', text: reply || 'Sorry, I could not generate a reply right now.' },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { from: 'ai', text: 'Something went wrong connecting. Please try again.' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={30}
      />
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.name}>Tarot Reading Chat</ThemedText>
            <ThemedText style={styles.tagline}>Your three cards · Ask anything</ThemedText>
          </View>
        </View>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            {cards.length === 3 && (
              <View style={styles.cardsCard}>
                <View style={styles.cardsRow}>
                  {cards.map((c, i) => (
                    <View key={`${c.name}-${i}`} style={styles.miniCard}>
                      <View style={styles.miniBadge}>
                        <ThemedText style={styles.miniNo}>{i + 1}</ThemedText>
                      </View>
                      <ThemedText style={styles.miniName} numberOfLines={1}>
                        {c.name}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                {combo ? (
                  <View style={styles.comboRow}>
                    <Ionicons name="sparkles" size={16} color={ACCENT} />
                    <ThemedText style={styles.comboText}>{combo}</ThemedText>
                  </View>
                ) : null}
              </View>
            )}

            {messages.map((m, i) => (
              <View
                key={i}
                style={[styles.msg, m.from === 'user' ? styles.msgUser : styles.msgAi]}>
                <ThemedText
                  style={[styles.msgText, m.from === 'user' ? styles.msgTextUser : styles.msgTextAi]}>
                  {m.text}
                </ThemedText>
              </View>
            ))}
            {typing && (
              <View style={[styles.msg, styles.msgAi]}>
                <ThemedText style={[styles.msgText, styles.msgTextAi]}>…</ThemedText>
              </View>
            )}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Ask about your cards…"
              placeholderTextColor="#7E7E78"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send}>
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,18,18,0.65)' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68,64,57,0.4)',
    backgroundColor: 'transparent',
  },
  backBtn: { padding: 8 },
  headerInfo: { marginLeft: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  tagline: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  content: { padding: 16, paddingBottom: 20 },
  cardsCard: {
    backgroundColor: 'rgba(29,29,28,0.5)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.4)',
  },
  cardsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  miniCard: {
    flex: 1,
    backgroundColor: 'rgba(41,39,35,0.6)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.3)',
  },
  miniBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniNo: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  miniName: { fontSize: 13, color: '#EEEDE0', fontWeight: '600', textAlign: 'center' },
  comboRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  comboText: { flex: 1, fontSize: 13, color: '#7E7E78', lineHeight: 19 },
  msg: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  msgAi: { backgroundColor: 'rgba(29,29,28,0.6)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgUser: { backgroundColor: ACCENT, alignSelf: 'flex-end', borderBottomRightRadius: 4,
    shadowColor: ACCENT, shadowOpacity: 0.7, shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextAi: { color: '#EEEDE0' },
  msgTextUser: { color: '#ffffff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(68,64,57,0.4)',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(41,39,35,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
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