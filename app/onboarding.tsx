import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GENDERS, NAKSHATRAS, PLACES, RASHIS } from '@/constants/birth';
import { useAuth, type BirthDetails } from '@/contexts/auth-context';

const ACCENT = '#B09C66';
const WARN = '#C9A24B';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, saveBirthDetails } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState<BirthDetails['gender']>('male');
  const [dobDate, setDobDate] = useState(new Date(1995, 0, 1));
  const [tobDate, setTobDate] = useState(new Date(1995, 0, 1, 6, 0));
  const [tobKnown, setTobKnown] = useState(true);
  const [rashi, setRashi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [place, setPlace] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showPlace, setShowPlace] = useState(false);
  const [showRashi, setShowRashi] = useState(false);
  const [showNakshatra, setShowNakshatra] = useState(false);

  const finish = async () => {
    if (!name.trim() || !place) return;
    const details: BirthDetails = {
      name: name.trim(),
      gender,
      dob: formatDate(dobDate),
      dobDate,
      tob: `${String(tobDate.getHours()).padStart(2, '0')}:${String(tobDate.getMinutes()).padStart(2, '0')}`,
      tobDate,
      tobKnown,
      place,
      rashi: tobKnown ? undefined : rashi,
      nakshatra: tobKnown ? undefined : nakshatra,
    };
    await saveBirthDetails(details);
    router.replace('/(tabs)');
  };

  const canFinish = name.trim().length > 0 && place.length > 0 && (tobKnown || (rashi && nakshatra));

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Let{'\''}s get to know you</ThemedText>
              <ThemedText style={styles.subtitle}>
                This helps us prepare your accurate birth chart
              </ThemedText>
            </View>

            <View style={styles.card}>
              <ThemedText style={styles.label}>Full Name</ThemedText>
              <View style={styles.field}>
                <Ionicons name="person-outline" size={18} color="#7E7E78" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#7E7E78"
                />
              </View>

              <ThemedText style={styles.label}>Gender</ThemedText>
              <View style={styles.chipRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.chip, gender === g.id && styles.chipActive]}
                    onPress={() => setGender(g.id as BirthDetails['gender'])}>
                    <ThemedText
                      style={[styles.chipText, gender === g.id && styles.chipTextActive]}>
                      {g.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={styles.label}>Date of Birth</ThemedText>
              <TouchableOpacity style={styles.field} onPress={() => setShowDate(true)}>
                <Ionicons name="calendar-outline" size={18} color="#7E7E78" />
                <ThemedText style={styles.fieldValue}>{formatDate(dobDate)}</ThemedText>
              </TouchableOpacity>

              <View style={styles.tobHeader}>
                <ThemedText style={styles.label}>Time of Birth</ThemedText>
                <TouchableOpacity onPress={() => setTobKnown((v) => !v)}>
                  <ThemedText style={styles.toggle}>
                    {tobKnown ? "I don't know exact time" : 'I know exact time'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {tobKnown ? (
                <TouchableOpacity style={styles.field} onPress={() => setShowTime(true)}>
                  <Ionicons name="time-outline" size={18} color="#7E7E78" />
                  <ThemedText style={styles.fieldValue}>
                    {String(tobDate.getHours()).padStart(2, '0')}:
                    {String(tobDate.getMinutes()).padStart(2, '0')}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <View>
                  <ThemedText style={styles.hint}>
                    If you don{'\''}t know your exact birth time, tell us your Rashi and Nakshatra
                    instead.                  </ThemedText>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.field, styles.rowField]}
                      onPress={() => setShowRashi(true)}>
                      <Ionicons name="star-outline" size={18} color="#7E7E78" />
                      <ThemedText
                        style={[styles.fieldValue, !rashi && styles.placeholder]}>
                        {rashi || 'Rashi'}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.field, styles.rowField]}
                      onPress={() => setShowNakshatra(true)}>
                      <Ionicons name="moon-outline" size={18} color="#7E7E78" />
                      <ThemedText
                        style={[styles.fieldValue, !nakshatra && styles.placeholder]}>
                        {nakshatra || 'Nakshatra'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <ThemedText style={styles.label}>Place of Birth</ThemedText>
              <TouchableOpacity style={styles.field} onPress={() => setShowPlace(true)}>
                <Ionicons name="location-outline" size={18} color="#7E7E78" />
                <ThemedText
                  style={[styles.fieldValue, !place && styles.placeholder]}>
                  {place || 'Select your birth place'}
                </ThemedText>
                <Ionicons name="chevron-down" size={18} color="#7E7E78" />
              </TouchableOpacity>

              <View style={styles.warnBox}>
                <Ionicons name="information-circle" size={20} color={WARN} />
                <ThemedText style={styles.warnText}>
                  Note: If your birth time is wrong, your results may be inaccurate.
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.finishBtn, !canFinish && styles.finishBtnDisabled]}
              onPress={finish}
              disabled={!canFinish}>
              <Ionicons name="sparkles" size={20} color="#ffffff" />
              <ThemedText style={styles.finishBtnText}>Continue</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {showDate && (
        <DateTimePicker
          value={dobDate}
          mode="date"
          maximumDate={new Date()}
          display="default"
          onChange={(e, date) => {
            setShowDate(false);
            if (e.type !== 'dismissed' && date) setDobDate(date);
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={tobDate}
          mode="time"
          is24Hour
          display="default"
          onChange={(e, date) => {
            setShowTime(false);
            if (e.type !== 'dismissed' && date) setTobDate(date);
          }}
        />
      )}

      <PickerModal
        visible={showPlace}
        title="Place of Birth"
        items={PLACES}
        selected={place}
        onSelect={(v) => {
          setPlace(v);
          setShowPlace(false);
        }}
        onClose={() => setShowPlace(false)}
      />
      <PickerModal
        visible={showRashi}
        title="Select Rashi"
        items={RASHIS}
        selected={rashi}
        onSelect={(v) => {
          setRashi(v);
          setShowRashi(false);
        }}
        onClose={() => setShowRashi(false)}
      />
      <PickerModal
        visible={showNakshatra}
        title="Select Nakshatra"
        items={NAKSHATRAS}
        selected={nakshatra}
        onSelect={(v) => {
          setNakshatra(v);
          setShowNakshatra(false);
        }}
        onClose={() => setShowNakshatra(false)}
      />
    </ThemedView>
  );
}

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function PickerModal({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#EEEDE0" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.modalItem, item === selected && styles.modalItemActive]}
                onPress={() => onSelect(item)}>
                <ThemedText
                  style={[
                    styles.modalItemText,
                    item === selected && styles.modalItemTextActive,
                  ]}>
                  {item}
                </ThemedText>
                {item === selected && (
                  <Ionicons name="checkmark" size={18} color={ACCENT} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 8, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#EEEDE0' },
  subtitle: { fontSize: 13, color: '#7E7E78', marginTop: 4 },
  card: {
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    padding: 18,
  },
  label: { fontSize: 13, color: '#7E7E78', fontWeight: '600', marginTop: 16, marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#292723',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldValue: { flex: 1, fontSize: 15, color: '#EEEDE0' },
  placeholder: { color: '#7E7E78' },
  input: { flex: 1, fontSize: 15, color: '#EEEDE0' },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#292723',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: 'rgba(176,156,102,0.2)', borderColor: ACCENT },
  chipText: { fontSize: 14, color: '#7E7E78' },
  chipTextActive: { color: '#EEEDE0', fontWeight: '600' },
  tobHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { fontSize: 12, color: ACCENT, fontWeight: '600', marginTop: 16 },
  hint: { fontSize: 12, color: '#7E7E78', lineHeight: 17, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(201,162,75,0.12)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  warnText: { flex: 1, fontSize: 12, color: '#C9A24B', lineHeight: 17 },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  finishBtnDisabled: { opacity: 0.4 },
  finishBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1D1D1C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0' },
  modalList: { flexGrow: 0 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#292723',
  },
  modalItemActive: { backgroundColor: 'rgba(176,156,102,0.12)', borderRadius: 10 },
  modalItemText: { fontSize: 15, color: '#EEEDE0' },
  modalItemTextActive: { color: ACCENT, fontWeight: '600' },
});