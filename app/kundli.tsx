import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

type KundliData = {
  name: string;
  birthDate: string;
  birthTime: string;
  place: string;
  rashi: string;
  nakshatra: string;
  lagna: string;
  planets: { name: string; sign: string; house: number; degree: string }[];
  houses: { num: number; sign: string; lord: string }[];
};

export default function KundliScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [place, setPlace] = useState('');
  const [kundli, setKundli] = useState<KundliData | null>(null);

  const generate = () => {
    if (!name) return;
    const rashiIdx = Math.floor(Math.random() * 12);
    const nakIdx = Math.floor(Math.random() * 27);
    setKundli({
      name,
      birthDate: birthDate || '15/08/1990',
      birthTime: birthTime || '10:30 AM',
      place: place || 'Chennai',
      rashi: RASHIS[rashiIdx],
      nakshatra: NAKSHATRAS[nakIdx],
      lagna: RASHIS[Math.floor(Math.random() * 12)],
      planets: [
        { name: 'Sun', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Moon', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Mars', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Mercury', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Jupiter', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Venus', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
        { name: 'Saturn', sign: RASHIS[Math.floor(Math.random() * 12)], house: 1 + Math.floor(Math.random() * 12), degree: (Math.random() * 30).toFixed(1) + '°' },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        num: i + 1,
        sign: RASHIS[(rashiIdx + i) % 12],
        lord: RASHIS[(rashiIdx + i) % 12],
      })),
    });
  };

  const reset = () => { setName(''); setBirthDate(''); setBirthTime(''); setPlace(''); setKundli(null); };

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Kundli Analysis</Text>
            <View style={{ width: 40 }} />
          </View>

          {!kundli ? (
            <View style={s.formSection}>
              <View style={s.inputCard}>
                <View style={s.inputRow}>
                  <Ionicons name="person" size={18} color={ACCENT} />
                  <TextInput style={s.input} placeholder="Full Name" placeholderTextColor="#AAAAAA" value={name} onChangeText={setName} />
                </View>
                <View style={s.divider} />
                <View style={s.inputRow}>
                  <Ionicons name="calendar" size={18} color={ACCENT} />
                  <TextInput style={s.input} placeholder="Birth Date (DD/MM/YYYY)" placeholderTextColor="#AAAAAA" value={birthDate} onChangeText={setBirthDate} />
                </View>
                <View style={s.divider} />
                <View style={s.inputRow}>
                  <Ionicons name="time" size={18} color={ACCENT} />
                  <TextInput style={s.input} placeholder="Birth Time (HH:MM)" placeholderTextColor="#AAAAAA" value={birthTime} onChangeText={setBirthTime} />
                </View>
                <View style={s.divider} />
                <View style={s.inputRow}>
                  <Ionicons name="location" size={18} color={ACCENT} />
                  <TextInput style={s.input} placeholder="Birth Place" placeholderTextColor="#AAAAAA" value={place} onChangeText={setPlace} />
                </View>
              </View>
              <TouchableOpacity style={s.genBtn} onPress={generate}>
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={s.genBtnTxt}>Generate Kundli</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.resultSection}>
              {/* Basic Info */}
              <View style={s.infoCard}>
                <Text style={s.infoName}>{kundli.name}</Text>
                <Text style={s.infoSub}>{kundli.birthDate} · {kundli.birthTime} · {kundli.place}</Text>
                <View style={s.infoChips}>
                  <View style={s.chip}><Text style={s.chipLabel}>Rashi</Text><Text style={s.chipValue}>{kundli.rashi}</Text></View>
                  <View style={s.chip}><Text style={s.chipLabel}>Nakshatra</Text><Text style={s.chipValue}>{kundli.nakshatra}</Text></View>
                  <View style={s.chip}><Text style={s.chipLabel}>Lagna</Text><Text style={s.chipValue}>{kundli.lagna}</Text></View>
                </View>
              </View>

              {/* Planets */}
              <Text style={s.sectionTitle}>Planetary Positions</Text>
              <View style={s.tableHeader}>
                <Text style={[s.tableHead, { flex: 1.2 }]}>Planet</Text>
                <Text style={[s.tableHead, { flex: 1.5 }]}>Sign</Text>
                <Text style={[s.tableHead, { flex: 0.8 }]}>House</Text>
                <Text style={[s.tableHead, { flex: 1, textAlign: 'right' }]}>Degree</Text>
              </View>
              {kundli.planets.map((p, i) => (
                <View key={i} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
                  <Text style={[s.tableCell, { flex: 1.2, fontWeight: '600' }]}>{p.name}</Text>
                  <Text style={[s.tableCell, { flex: 1.5 }]}>{p.sign}</Text>
                  <Text style={[s.tableCell, { flex: 0.8 }]}>{p.house}</Text>
                  <Text style={[s.tableCell, { flex: 1, textAlign: 'right' }]}>{p.degree}</Text>
                </View>
              ))}

              {/* Houses */}
              <Text style={s.sectionTitle}>Bhava Chart</Text>
              <View style={s.housesGrid}>
                {kundli.houses.map((h) => (
                  <View key={h.num} style={s.houseCard}>
                    <Text style={s.houseNum}>{h.num}</Text>
                    <Text style={s.houseSign}>{h.sign}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={s.resetBtn} onPress={reset}>
                <Text style={s.resetBtnTxt}>Generate New</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  formSection: { paddingHorizontal: 16 },
  inputCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  divider: { height: 1, backgroundColor: '#E8E8E8', marginHorizontal: 14 },
  genBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
  },
  genBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  resultSection: { paddingHorizontal: 16 },
  infoCard: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 16,
  },
  infoName: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  infoSub: { fontSize: 12, color: TEXT_MID, marginTop: 4 },
  infoChips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  chipLabel: { fontSize: 10, color: TEXT_MID },
  chipValue: { fontSize: 13, fontWeight: '600', color: ACCENT, marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 10 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F0EDE4', borderRadius: 8, marginBottom: 4 },
  tableHead: { fontSize: 11, fontWeight: '700', color: TEXT_MID },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tableCell: { fontSize: 12, color: TEXT_DARK },

  housesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  houseCard: {
    width: '30%', backgroundColor: CARD_BG, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: BORDER,
  },
  houseNum: { fontSize: 11, color: TEXT_MID },
  houseSign: { fontSize: 13, fontWeight: '600', color: ACCENT, marginTop: 4 },

  resetBtn: {
    marginTop: 20, backgroundColor: CARD_BG, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDER,
  },
  resetBtnTxt: { fontSize: 14, fontWeight: '600', color: ACCENT },
});
