import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { callAIWithFallback, type ChatMessage } from '@/lib/ai/providers';
import { classifyIntent } from '@/lib/ai/intent-classifier';
import { detectLanguage } from '@/lib/ai/language-detector';
import { formatContextAsSystemPrompt, type UserContext } from '@/lib/ai/context-builder';
import { routeToSpecialist } from '@/lib/specialists/index';
import { computeAstroReport } from '@/lib/pipeline';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getAISpecialist, getLocalizedName, getLocalizedTagline } from '@/constants/ai-specialists';
import { useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';

export default function AIChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, user, birthDetails } = useAuth();
  const spec = getAISpecialist(id ?? 'health')!;
  const localName = getLocalizedName(spec, language);
  const localTagline = getLocalizedTagline(spec, language);
  const [messages, setMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    { from: 'ai', text: `Namaskaram! 🙏 I'm your ${localName}. Ask me anything about ${localTagline.toLowerCase()} — I'll check your chart and guide you.` },
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
      const userName = user?.name || user?.email?.split('@')[0] || 'friend';

      const userContext: UserContext = {
        name: userName,
        dob: birthDetails?.dob,
        tob: birthDetails?.tobKnown ? birthDetails?.tob : undefined,
        place: birthDetails?.place,
        rashi: birthDetails?.rashi,
        nakshatra: birthDetails?.nakshatra,
        gothram: birthDetails?.gothram,
      };

      let systemPrompt: string;

      if (birthDetails?.dobDate) {
        try {
          const birthDate = birthDetails.tobKnown && birthDetails.tobDate
            ? birthDetails.tobDate
            : birthDetails.dobDate;
          const report = computeAstroReport({ birthDate, place: birthDetails?.place });
          const intent = classifyIntent(question);
          const lang = detectLanguage(question);

          const specialistResult = routeToSpecialist(
            intent,
            userContext,
            report._rawChart,
            report._rawDasha,
            report._rawTransits,
            report.moonRashiIndex,
            question,
          );

          const verifiedContextPrompt = formatContextAsSystemPrompt(specialistResult.context);

          const tanglishInstruction = language === 'ta'
            ? 'Tanglish - mix Tamil words in English script naturally. Use: vanakkam, romba nalla irukkum, solren, ketkkanum, mudiyadhu, aaganum, irukkum, thaan, la, okke, ponathu, vandhadhu, nu. Talk like a friendly Tamil periyavar doing jyotish.'
            : language === 'hi'
              ? 'Hindi in English script mixed with English. Use: aapka, bahut accha, hai, mein, ko, ka, ke, liye, bolte hain, samajhte hain, bilkul, ekdum'
              : 'English with Tamil astrological terms like Rahu kaalam, Nalla neram, dosham, porutham';

          const nativeInstruction = language === 'ta'
            ? 'Tamil words throughout every sentence'
            : language === 'hi'
              ? 'Hindi words throughout'
              : 'Tamil terms';

          systemPrompt = [
            `You are ${localName}, a friendly ${localTagline.toLowerCase()} in Koshmira astrology app.`,
            ``,
            verifiedContextPrompt,
            ``,
            `CRITICAL: You MUST reply in ${tanglishInstruction}`,
            `DO NOT reply in pure English. MUST use ${nativeInstruction}.`,
            `Be warm like a South Indian paatti/thatha who does jyotish.`,
            `Use Vedic concepts: planets, houses, nakshatras, dasha, dosham.`,
            `NEVER invent planetary positions, doshas, dasha dates, or predictions. Use ONLY the verified data above.`,
            `If required data is missing, honestly say the calculation is unavailable.`,
            `3-5 sentences max. Ask one follow-up.`,
          ].join('\n');
        } catch {
          systemPrompt = buildFallbackPrompt(userName, localName, localTagline);
        }
      } else {
        systemPrompt = buildFallbackPrompt(userName, localName, localTagline);
      }

      const history = messages
        .filter((m) => !m.text.startsWith("Hi! I'm your"))
        .map((m): ChatMessage => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));

      const aiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: question },
      ];

      const result = await callAIWithFallback(aiMessages);
      const reply = result?.content || 'Sorry, I could not generate a reply right now.';

      setMessages((m) => [
        ...m,
        { from: 'ai', text: reply },
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

  const buildFallbackPrompt = (userName: string, localName: string, localTagline: string): string => {
    const tanglishInstruction = language === 'ta'
      ? 'Tanglish - mix Tamil words in English script naturally.'
      : language === 'hi'
        ? 'Hindi in English script mixed with English.'
        : 'English with Tamil astrological terms.';
    return [
      `You are ${localName}, a friendly ${localTagline.toLowerCase()} in Koshmira astrology app.`,
      `User: ${userName}`,
      `CRITICAL: You MUST reply in ${tanglishInstruction}`,
      `Be warm like a South Indian paatti/thatha who does jyotish.`,
      `Today: ${spec.report.join(' ')}`,
      `3-5 sentences max. Ask one follow-up.`,
    ].join('\n');
  };

  const clearHistory = () => {
    const welcome = { from: 'ai' as const, text: `Namaskaram! 🙏 I'm your ${localName}. Ask me anything about ${localTagline.toLowerCase()} — I'll check your chart and guide you.` };
    Alert.alert('Clear Chat History?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setMessages([welcome]);
          AsyncStorage.removeItem(`ai-chat:${id}`).catch(() => {});
        },
      },
    ]);
  };

  const placeholder =
    language === 'ta' ? 'AI நிபுணரிடம் கேளுங்கள்...' :
    language === 'hi' ? 'AI विशेषज्ञ से पूछें...' :
    'Ask your AI specialist...';

  const reportTitle =
    language === 'ta' ? 'இன்றைய பலன்' :
    language === 'hi' ? 'आज का राशिफल' :
    "Today's Reading";

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
            <ThemedText style={styles.name}>{localName}</ThemedText>
            <ThemedText style={styles.tagline}>{localTagline}</ThemedText>
          </View>
          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color="#EEEDE0" />
          </TouchableOpacity>
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
                <ThemedText style={styles.reportTitle}>{reportTitle}</ThemedText>
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
              placeholder={placeholder}
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
  clearBtn: { padding: 8, marginLeft: 'auto' },
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