import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/avatar';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { computeVedicChart } from '@/lib/vedic';
import { ZODIAC_SIGNS } from '@/constants/zodiac';
import { RASHIS, NAKSHATRAS } from '@/constants/birth';
import { PLACE_COORDS } from '@/constants/birth';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';
const GREEN = '#7BD88F';

type PlaceResult = { name: string; lat: number; lon: number };

const searchPlace = async (query: string): Promise<PlaceResult[]> => {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    );
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch { return []; }
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, birthDetails, saveBirthDetails } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  // Editable birth details
  const [editing, setEditing] = useState(false);
  const [dob, setDob] = useState(birthDetails?.dobDate ? new Date(birthDetails.dobDate) : new Date(1995, 0, 1));
  const [tob, setTob] = useState(birthDetails?.tobDate ? new Date(birthDetails.tobDate) : new Date(1995, 0, 1, 6, 0));
  const [place, setPlace] = useState(birthDetails?.place ?? '');
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [showDob, setShowDob] = useState(false);
  const [showTob, setShowTob] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (birthDetails?.dobDate) setDob(new Date(birthDetails.dobDate));
    if (birthDetails?.tobDate) setTob(new Date(birthDetails.tobDate));
    if (birthDetails?.place) setPlace(birthDetails.place);
  }, [user?.name, birthDetails]);

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Get zodiac info from rashi
  const rashiIndex = birthDetails?.rashi ? RASHIS.findIndex((r) => r.name === birthDetails.rashi) : -1;
  const zodiac = rashiIndex >= 0 ? ZODIAC_SIGNS[rashiIndex] : null;
  const rashiData = rashiIndex >= 0 ? RASHIS[rashiIndex] : null;
  const nakData = birthDetails?.nakshatra ? NAKSHATRAS.find((n) => n.name === birthDetails.nakshatra) : null;
  const hasBirthData = !!(birthDetails?.rashi && birthDetails?.dob);

  console.log('[EditProfile] rashiIndex:', rashiIndex, 'zodiac:', zodiac?.name, 'hasBirthData:', hasBirthData);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('users')
          .upsert({ id: authUser.id, email: user?.email, name: name.trim() }, { onConflict: 'email' });
        Alert.alert('Saved', 'Profile updated');
      }
    } catch {
      Alert.alert('Error', 'Failed to save');
    }
    setSaving(false);
  };

  const handleSaveBirth = async () => {
    setSaving(true);
    try {
      const fullDate = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate(), tob.getHours(), tob.getMinutes());
      const tobDate = new Date(1995, 0, 1, tob.getHours(), tob.getMinutes());

      // Compute rasi/nakshatra
      const chart = computeVedicChart(fullDate);

      // Resolve place coords
      let coords = placeCoords;
      if (!coords && place) {
        const match = Object.entries(PLACE_COORDS).find(([city]) =>
          place.toLowerCase().includes(city.toLowerCase()),
        );
        if (match) coords = match[1];
      }

      await saveBirthDetails({
        name: name.trim(),
        gender: birthDetails?.gender ?? 'male',
        dob: `${String(dob.getDate()).padStart(2, '0')}/${String(dob.getMonth() + 1).padStart(2, '0')}/${dob.getFullYear()}`,
        dobDate: fullDate,
        tob: `${String(tob.getHours()).padStart(2, '0')}:${String(tob.getMinutes()).padStart(2, '0')}`,
        tobDate: tobDate,
        tobKnown: true,
        place,
        rasi: chart.rashi,
        nakshatra: chart.nakshatra,
      });
      Alert.alert('Saved', 'Birth details updated');
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save birth details');
    }
    setSaving(false);
  };

  const handlePlaceSearch = async (query: string) => {
    if (query.length < 3) { setPlaceResults([]); return; }
    const results = await searchPlace(query);
    setPlaceResults(results);
  };

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={editing ? handleSaveBirth : handleSaveProfile} disabled={saving}>
            <Text style={s.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <Avatar uri={user?.avatar ?? ''} name={name} size={80} color={ACCENT} />
        </View>

        {/* Name Card */}
        <View style={s.card}>
          <Text style={s.label}>Full Name</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={TEXT_DIM}
          />
        </View>

        {/* Birth Details Display with Zodiac */}
        {hasBirthData && !editing && (
          <View style={s.zodiacCard}>
            {/* Zodiac Image */}
            <View style={s.zodiacHeader}>
              {zodiac && <Image source={zodiac.image} style={s.zodiacImage} contentFit="cover" />}
              <View style={s.zodiacInfo}>
                {zodiac && <Text style={s.zodiacEmoji}>{zodiac.emoji}</Text>}
                {zodiac && <Text style={s.zodiacName}>{zodiac.name}</Text>}
                <Text style={s.zodiacRashi}>{rashiData?.nameTa} / {rashiData?.name}</Text>
              </View>
            </View>

            {/* Details */}
            <View style={s.detailRow}>
              <Ionicons name="calendar" size={16} color={ACCENT} />
              <Text style={s.detailLabel}>Date of Birth</Text>
              <Text style={s.detailValue}>{birthDetails.dob}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Ionicons name="time" size={16} color={ACCENT} />
              <Text style={s.detailLabel}>Time of Birth</Text>
              <Text style={s.detailValue}>{birthDetails.tob}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Ionicons name="location" size={16} color={ACCENT} />
              <Text style={s.detailLabel}>Place</Text>
              <Text style={s.detailValue} numberOfLines={1}>{birthDetails.place}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Ionicons name="moon" size={16} color={ACCENT} />
              <Text style={s.detailLabel}>Rasi</Text>
              <Text style={s.detailValue}>{birthDetails.rashi}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Ionicons name="star" size={16} color={ACCENT} />
              <Text style={s.detailLabel}>Nakshatra</Text>
              <Text style={s.detailValue}>{birthDetails.nakshatra} {nakData?.nameTa ? `(${nakData.nameTa})` : ''}</Text>
            </View>

            <TouchableOpacity style={s.editBirthBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={16} color={ACCENT} />
              <Text style={s.editBirthBtnTxt}>Edit Birth Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Birth Details Form */}
        {editing && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Edit Birth Details</Text>

            {/* DOB */}
            <TouchableOpacity style={s.formRow} onPress={() => setShowDob(true)}>
              <Ionicons name="calendar" size={16} color={ACCENT} />
              <Text style={s.formLabel}>Date of Birth</Text>
              <Text style={s.formValue}>{formatDate(dob)}</Text>
            </TouchableOpacity>
            {showDob && (
              <DateTimePicker value={dob} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
                onChange={(_: DateTimePickerEvent, date?: Date) => { setShowDob(Platform.OS === 'ios'); if (date) setDob(date); }} />
            )}

            <View style={s.formDivider} />

            {/* TOB */}
            <TouchableOpacity style={s.formRow} onPress={() => setShowTob(true)}>
              <Ionicons name="time" size={16} color={ACCENT} />
              <Text style={s.formLabel}>Time of Birth</Text>
              <Text style={s.formValue}>{formatTime(tob)}</Text>
            </TouchableOpacity>
            {showTob && (
              <DateTimePicker value={tob} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour
                onChange={(_: DateTimePickerEvent, date?: Date) => { setShowTob(Platform.OS === 'ios'); if (date) setTob(date); }} />
            )}

            <View style={s.formDivider} />

            {/* Place */}
            <View style={s.formRow}>
              <Ionicons name="location" size={16} color={ACCENT} />
              <TextInput style={s.formInput} placeholder="Place of Birth" placeholderTextColor={TEXT_DIM} value={place}
                onChangeText={(v) => { setPlace(v); setPlaceCoords(null); handlePlaceSearch(v); }} />
            </View>
            {placeResults.length > 0 && (
              <View style={s.placeDropdown}>
                {placeResults.map((p, i) => (
                  <TouchableOpacity key={i} style={s.placeOption}
                    onPress={() => { setPlace(p.name); setPlaceCoords({ lat: p.lat, lon: p.lon }); setPlaceResults([]); }}>
                    <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                    <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={s.cancelEditBtn} onPress={() => setEditing(false)}>
              <Text style={s.cancelEditBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigate to Onboarding */}
        {!editing && (
          <TouchableOpacity style={s.birthCard} onPress={() => router.push('/onboarding')}>
            <View style={s.birthLeft}>
              <View style={s.birthIcon}>
                <Ionicons name="refresh" size={20} color={ACCENT} />
              </View>
              <View style={s.birthInfo}>
                <Text style={s.birthTitle}>Retake Onboarding</Text>
                <Text style={s.birthSub}>Refresh your birth information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  saveBtn: { fontSize: 15, fontWeight: '600', color: ACCENT },

  scroll: { paddingBottom: 40 },

  avatarSection: { alignItems: 'center', paddingVertical: 20 },

  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, paddingVertical: 14 },
  label: { fontSize: 12, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { fontSize: 15, color: TEXT_DARK, padding: 0 },

  // Zodiac Card
  zodiacCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  zodiacHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  zodiacImage: { width: 64, height: 64, borderRadius: 32 },
  zodiacInfo: { flex: 1 },
  zodiacEmoji: { fontSize: 22, marginBottom: 2 },
  zodiacName: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  zodiacRashi: { fontSize: 12, color: ACCENT, marginTop: 2 },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  detailLabel: { fontSize: 13, color: TEXT_MID, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '500', color: TEXT_DARK, flex: 1.5, textAlign: 'right' },
  detailDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16 },

  editBirthBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  editBirthBtnTxt: { fontSize: 13, fontWeight: '600', color: ACCENT },

  // Form
  formCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 14 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  formLabel: { fontSize: 13, color: TEXT_MID, flex: 1 },
  formValue: { fontSize: 13, fontWeight: '500', color: TEXT_DARK, textAlign: 'right' },
  formInput: { flex: 1, fontSize: 13, color: TEXT_DARK, padding: 0 },
  formDivider: { height: 1, backgroundColor: '#F0F0F0' },

  placeDropdown: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: BORDER, marginTop: 6, maxHeight: 140 },
  placeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: BORDER },
  placeOptionTxt: { fontSize: 11, color: TEXT_MID, flex: 1 },

  cancelEditBtn: { marginTop: 12, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  cancelEditBtnTxt: { fontSize: 13, fontWeight: '500', color: TEXT_MID },

  // Bottom Card
  birthCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  birthLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  birthIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: ACCENT + '15', alignItems: 'center', justifyContent: 'center' },
  birthInfo: { flex: 1 },
  birthTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  birthSub: { fontSize: 12, color: TEXT_DIM, marginTop: 2 },
});
