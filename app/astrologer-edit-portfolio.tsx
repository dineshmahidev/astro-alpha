import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

const ALL_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];
const ALL_SPECS = ['Vedic Astrology', 'Numerology', 'Palmistry', 'Tarot', 'Vastu', 'KP System', 'Nadi Astrology', 'Prashna'];

export default function AstrologerEditPortfolioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();

  const myAstro = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [astrologers, user?.email],
  );

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(myAstro?.bio ?? '');
  const [specialty, setSpecialty] = useState(myAstro?.specialty ?? '');
  const [location, setLocation] = useState(myAstro?.location ?? '');
  const [experience, setExperience] = useState(myAstro?.experience ?? '');
  const [languages, setLanguages] = useState<string[]>(['English', 'Tamil']);
  const [specs, setSpecs] = useState<string[]>(myAstro?.specialty ? [myAstro.specialty] : ['Vedic Astrology']);

  const toggleLang = (lang: string) => {
    setLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);
  };

  const toggleSpec = (sp: string) => {
    setSpecs((prev) => prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]);
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Your portfolio has been updated.');
    router.back();
  };

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Portfolio</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <Avatar uri={myAstro?.avatar ?? ''} name={user?.name ?? 'A'} size={80} color={ACCENT} />
          <TouchableOpacity style={s.editAvatarBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={s.label}>Full Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#AAA" />

        {/* Bio */}
        <Text style={s.label}>Bio</Text>
        <TextInput
          style={[s.input, s.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Describe your expertise..."
          placeholderTextColor="#AAA"
          multiline
          textAlignVertical="top"
        />

        {/* Specialty */}
        <Text style={s.label}>Specialty</Text>
        <TextInput style={s.input} value={specialty} onChangeText={setSpecialty} placeholder="e.g. Vedic Astrology" placeholderTextColor="#AAA" />

        {/* Location */}
        <Text style={s.label}>Location</Text>
        <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="City" placeholderTextColor="#AAA" />

        {/* Experience */}
        <Text style={s.label}>Experience</Text>
        <TextInput style={s.input} value={experience} onChangeText={setExperience} placeholder="e.g. 5 years" placeholderTextColor="#AAA" />

        {/* Languages */}
        <Text style={s.label}>Languages</Text>
        <View style={s.chipRow}>
          {ALL_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[s.chip, languages.includes(lang) && s.chipActive]}
              onPress={() => toggleLang(lang)}
            >
              <Text style={[s.chipTxt, languages.includes(lang) && s.chipTxtActive]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Specializations */}
        <Text style={s.label}>Specializations</Text>
        <View style={s.chipRow}>
          {ALL_SPECS.map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[s.chip, specs.includes(sp) && s.chipActive]}
              onPress={() => toggleSpec(sp)}
            >
              <Text style={[s.chipTxt, specs.includes(sp) && s.chipTxtActive]}>{sp}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone - NOT shown to protect privacy */}
        <Text style={s.label}>Contact</Text>
        <View style={s.infoCard}>
          <Ionicons name="lock-closed" size={14} color={TEXT_MID} />
          <Text style={s.infoTxt}>Phone number is kept private and never shared with users.</Text>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save Changes</Text>
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

  avatarWrap: { alignItems: 'center', marginVertical: 20 },
  editAvatarBtn: {
    position: 'absolute', bottom: -4, right: '38%',
    width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },

  label: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: TEXT_DARK,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
  },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipTxt: { fontSize: 12, color: TEXT_MID },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD_BG,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER,
  },
  infoTxt: { fontSize: 12, color: TEXT_MID, flex: 1 },

  saveBtn: {
    marginTop: 28, backgroundColor: ACCENT, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
