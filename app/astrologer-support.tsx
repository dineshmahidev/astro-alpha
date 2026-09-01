import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

const TOPICS = [
  'Account Issue',
  'Payment Problem',
  'Session Not Working',
  'Profile Update',
  'Technical Bug',
  'Other',
];

export default function AstrologerSupportScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!topic || !message.trim()) {
      Alert.alert('Required', 'Please select a topic and enter your message.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safe} edges={['top']}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Support</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={s.successWrap}>
            <View style={s.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={ACCENT} />
            </View>
            <Text style={s.successTitle}>Request Submitted</Text>
            <Text style={s.successMsg}>We'll get back to you within 24 hours via email.</Text>
            <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
              <Text style={s.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Support</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.desc}>How can we help you? Select a topic and describe your issue.</Text>

        <Text style={s.label}>Topic</Text>
        <View style={s.topicGrid}>
          {TOPICS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.topicChip, topic === t && s.topicActive]}
              onPress={() => setTopic(t)}
            >
              <Text style={[s.topicTxt, topic === t && s.topicTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Message</Text>
        <TextInput
          style={s.msgInput}
          placeholder="Describe your issue..."
          placeholderTextColor="#AAAAAA"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={s.submitBtnText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  desc: { fontSize: 13, color: TEXT_MID, lineHeight: 20, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginBottom: 8 },

  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  topicChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
  },
  topicActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  topicTxt: { fontSize: 12, color: TEXT_MID },
  topicTxtActive: { color: '#fff', fontWeight: '600' },

  msgInput: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    padding: 14, fontSize: 14, color: TEXT_DARK, minHeight: 140, marginBottom: 20,
  },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK },
  successMsg: { fontSize: 13, color: TEXT_MID, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  doneBtn: { marginTop: 28, backgroundColor: ACCENT, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14 },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
