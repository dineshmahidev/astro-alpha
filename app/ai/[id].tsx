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
import { getAISpecialist } from '@/constants/ai-specialists';

const ACCENT = '#B09C66';

export default function AIChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spec = getAISpecialist(id ?? 'health');
  const [messages, setMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    { from: 'ai', text: `Hi! I'm your ${spec.name}. Ask me anything about ${spec.tagline.toLowerCase()}.` },
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(`ai-chat:${id}`).then((saved) => {
      if (!active) return;
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          // ignore corrupt storage
        }
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(`ai-chat:${id}`, JSON.stringify(messages)).catch(() => {});
  }, [messages, loaded, id]);

  const send = async () => {
    if (!text.trim() || typing) return;
    const question = text.trim();
    setMessages((m) => [...m, { from: 'user', text: question }]);
    setText('');
    setTyping(true);
    try {
      const systemPrompt = [
        `You are ${spec.name}, a ${spec.tagline.toLowerCase()} in a premium Vedic astrology app.`,
        `Always reply in a warm, mystical, and spiritual tone, in simple English.`,
        `Use Vedic astrology concepts (planets, houses, nakshatras, dasha periods) in your answers.`,
        `Your today's reading highlights: ${spec.report.join(' ')}`,
        `Keep answers concise (3-5 short sentences). Ask one follow-up question when relevant.`,
      ].join(' ');
      const history = messages
        .filter((m) => !m.text.startsWith("Hi! I'm your"))
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
        source={spec.avatar}
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
          <Image source={spec.avatar} style={styles.avatar} contentFit="cover" />
          <View style={styles.headerInfo}>
            <ThemedText style={styles.name}>{spec.name}</ThemedText>
            <ThemedText style={styles.tagline}>{spec.tagline}</ThemedText>
          </View>
        </View>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Ionicons name={spec.icon as any} size={18} color={ACCENT} />
                <ThemedText style={styles.reportTitle}>Today's Reading</ThemedText>
              </View>
              {spec.report.map((r, i) => (
                <View key={i} style={styles.reportRow}>
                  <Ionicons name="sparkles" size={14} color={ACCENT} />
                  <ThemedText style={styles.reportText}>{r}</ThemedText>
                </View>
              ))}
            </View>

            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.msg,
                  m.from === 'user' ? styles.msgUser : styles.msgAi,
                ]}>
                <ThemedText
                  style={[
                    styles.msgText,
                    m.from === 'user' ? styles.msgTextUser : styles.msgTextAi,
                  ]}>
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
              placeholder="Ask your AI specialist..."
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
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,18,18,0.82)' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68,64,57,0.6)',
    backgroundColor: 'rgba(18,18,18,0.5)',
  },
  backBtn: { padding: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: ACCENT },
  headerInfo: { marginLeft: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  tagline: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  content: { padding: 16, paddingBottom: 20 },
  reportCard: {
    backgroundColor: 'rgba(29,29,28,0.85)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(68,64,57,0.6)',
  },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  reportTitle: { fontSize: 15, fontWeight: 'bold', color: '#EEEDE0' },
  reportRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  reportText: { flex: 1, fontSize: 13, color: '#7E7E78', lineHeight: 19 },
  msg: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  msgAi: { backgroundColor: 'rgba(29,29,28,0.85)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgUser: { backgroundColor: ACCENT, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
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
    borderTopColor: 'rgba(68,64,57,0.6)',
    backgroundColor: 'rgba(18,18,18,0.55)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(41,39,35,0.9)',
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
  },
});