import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const ACCENT = '#B09C66';
const GENDERS = ['Male', 'Female'];
const STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal',
];

type Person = {
  name: string;
  gender: string;
  dob: string;
  tob: string;
  place: string;
  sob: string;
  dobDate: Date;
  tobDate: Date;
};
type HistoryItem = {
  id: string;
  name1: string;
  name2: string;
  score: number;
  category: string;
  date: string;
  time: string;
};

const emptyPerson = (): Person => ({
  name: '',
  gender: 'Male',
  dob: '',
  tob: '',
  place: '',
  sob: '',
  dobDate: new Date(1995, 0, 1),
  tobDate: new Date(1995, 0, 1, 6, 0),
});

const categoryOf = (score: number) =>
  score >= 85 ? 'High Compatibility' : score >= 70 ? 'Good Compatibility' : 'Low Compatibility';

export default function MatchScreen() {
  const router = useRouter();
  const [p1, setP1] = useState<Person>(emptyPerson());
  const [p2, setP2] = useState<Person>(emptyPerson());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dateFor, setDateFor] = useState<null | 'p1' | 'p2'>(null);
  const [timeFor, setTimeFor] = useState<null | 'p1' | 'p2'>(null);
  const [sobFor, setSobFor] = useState<null | 'p1' | 'p2'>(null);

  const update = (which: 'p1' | 'p2', patch: Partial<Person>) =>
    which === 'p1' ? setP1((p) => ({ ...p, ...patch })) : setP2((p) => ({ ...p, ...patch }));

  const check = () => {
    if (!p1.name || !p2.name) return;
    const score = 55 + Math.floor(Math.random() * 45);
    const now = new Date();
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const item = {
      id: String(Date.now()),
      name1: p1.name,
      name2: p2.name,
      score,
      category: categoryOf(score),
      date,
      time,
    };
    setHistory((prev) => [item, ...prev]);
    setSelected(item);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Match Making</ThemedText>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.historyBtn}>
            <Ionicons name="time-outline" size={22} color={ACCENT} />
            <ThemedText style={styles.historyBtnText}>History</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <PersonFields
            person={p1}
            title="Person 1"
            onName={(v) => update('p1', { name: v })}
            onGender={(v) => update('p1', { gender: v })}
            onDOB={() => setDateFor('p1')}
            onTOB={() => setTimeFor('p1')}
            onPlace={(v) => update('p1', { place: v })}
            onSOB={() => setSobFor('p1')}
          />
          <PersonFields
            person={p2}
            title="Person 2"
            onName={(v) => update('p2', { name: v })}
            onGender={(v) => update('p2', { gender: v })}
            onDOB={() => setDateFor('p2')}
            onTOB={() => setTimeFor('p2')}
            onPlace={(v) => update('p2', { place: v })}
            onSOB={() => setSobFor('p2')}
          />

          <TouchableOpacity style={styles.btn} onPress={check}>
            <Ionicons name="heart" size={20} color="#ffffff" />
            <ThemedText style={styles.btnText}>Check Compatibility</ThemedText>
          </TouchableOpacity>

          {selected && (
            <View style={styles.resultCard}>
              <ThemedText style={styles.score}>{selected.score}%</ThemedText>
              <ThemedText style={styles.category}>{selected.category}</ThemedText>
              <ThemedText style={styles.pairText}>
                {selected.name1} ♥ {selected.name2}
              </ThemedText>
            </View>
          )}

        </ScrollView>

        <Modal visible={showHistory} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.historyModalHeader}>
                <ThemedText style={styles.modalTitle}>Match History</ThemedText>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color="#EEEDE0" />
                </TouchableOpacity>
              </View>
              {history.length === 0 ? (
                <ThemedText style={styles.emptyText}>No checks yet</ThemedText>
              ) : (
                <ScrollView style={styles.modalList}>
                  {history.map((h) => (
                    <TouchableOpacity
                      key={h.id}
                      style={styles.historyItem}
                      onPress={() => {
                        setSelected(h);
                        setShowHistory(false);
                      }}>
                      <View style={styles.historyInfo}>
                        <ThemedText style={styles.historyNames}>
                          {h.name1} ♥ {h.name2}
                        </ThemedText>
                        <ThemedText style={styles.historyDate}>
                          {h.date} · {h.time}
                        </ThemedText>
                      </View>
                      <View style={styles.historyRight}>
                        <ThemedText style={styles.historyScore}>{h.score}%</ThemedText>
                        <ThemedText style={styles.historyCat}>{h.category}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowHistory(false)}>
                <ThemedText style={styles.modalCloseText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {dateFor && (
          <DateTimePicker
            value={dateFor === 'p1' ? p1.dobDate : p2.dobDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              const which = dateFor;
              setDateFor(null);
              if (e.type !== 'dismissed' && date && which) {
                update(which, {
                  dobDate: date,
                  dob: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                });
              }
            }}
          />
        )}

        {timeFor && (
          <DateTimePicker
            value={timeFor === 'p1' ? p1.tobDate : p2.tobDate}
            mode="time"
            is24Hour
            display="default"
            onChange={(e, date) => {
              const which = timeFor;
              setTimeFor(null);
              if (e.type !== 'dismissed' && date && which) {
                update(which, {
                  tobDate: date,
                  tob: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
                });
              }
            }}
          />
        )}

        <Modal visible={!!sobFor} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>Select State of Birth</ThemedText>
              <ScrollView style={styles.modalList}>
                {STATES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.modalItem}
                    onPress={() => {
                      if (sobFor) update(sobFor, { sob: s });
                      setSobFor(null);
                    }}>
                    <ThemedText style={styles.modalItemText}>{s}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSobFor(null)}>
                <ThemedText style={styles.modalCloseText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

function PersonFields({
  person,
  title,
  onName,
  onGender,
  onDOB,
  onTOB,
  onPlace,
  onSOB,
}: {
  person: Person;
  title: string;
  onName: (v: string) => void;
  onGender: (v: string) => void;
  onDOB: () => void;
  onTOB: () => void;
  onPlace: (v: string) => void;
  onSOB: () => void;
}) {
  return (
    <View style={styles.personCard}>
      <View style={styles.personHeader}>
        <Ionicons name="person" size={18} color={ACCENT} />
        <ThemedText style={styles.personTitle}>{title}</ThemedText>
      </View>
      <View style={styles.field}>
        <Ionicons name="person-outline" size={18} color="#7E7E78" />
        <TextInput
          style={styles.input}
          value={person.name}
          onChangeText={onName}
          placeholder="Name"
          placeholderTextColor="#7E7E78"
        />
      </View>
      <View style={styles.genderRow}>
        <Ionicons name="male-female" size={18} color="#7E7E78" />
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderChip, person.gender === g && styles.genderChipActive]}
            onPress={() => onGender(g)}>
            <ThemedText
              style={[styles.genderText, person.gender === g && styles.genderTextActive]}>
              {g}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.field} onPress={onDOB}>
        <Ionicons name="calendar-outline" size={18} color="#7E7E78" />
        <ThemedText style={[styles.input, !person.dob && { color: '#7E7E78' }]}>
          {person.dob || 'Date of Birth'}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.field} onPress={onTOB}>
        <Ionicons name="time-outline" size={18} color="#7E7E78" />
        <ThemedText style={[styles.input, !person.tob && { color: '#7E7E78' }]}>
          {person.tob || 'Time of Birth'}
        </ThemedText>
      </TouchableOpacity>
      <View style={styles.field}>
        <Ionicons name="location-outline" size={18} color="#7E7E78" />
        <TextInput
          style={styles.input}
          value={person.place}
          onChangeText={onPlace}
          placeholder="Birth Place"
          placeholderTextColor="#7E7E78"
        />
      </View>
      <TouchableOpacity style={styles.field} onPress={onSOB}>
        <Ionicons name="map-outline" size={18} color="#7E7E78" />
        <ThemedText style={[styles.input, !person.sob && { color: '#7E7E78' }]}>
          {person.sob || 'State of Birth'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4, flex: 1 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  historyBtnText: { fontSize: 13, color: ACCENT, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  personCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  personTitle: { fontSize: 15, fontWeight: 'bold', color: '#EEEDE0' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#292723',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#EEEDE0' },
  genderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  genderChip: {
    backgroundColor: '#292723',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  genderChipActive: { backgroundColor: ACCENT },
  genderText: { fontSize: 13, color: '#EEEDE0' },
  genderTextActive: { color: '#ffffff', fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  resultCard: { alignItems: 'center', gap: 4, marginTop: 20, paddingVertical: 16 },
  score: { fontSize: 44, fontWeight: 'bold', color: ACCENT },
  category: { fontSize: 16, fontWeight: '600', color: '#EEEDE0' },
  pairText: { fontSize: 14, color: '#7E7E78', marginTop: 4 },
  historyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyText: { fontSize: 14, color: '#7E7E78', textAlign: 'center', paddingVertical: 30 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  historyItemActive: { borderWidth: 2, borderColor: ACCENT },
  historyInfo: { flex: 1 },
  historyNames: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  historyDate: { fontSize: 12, color: '#7E7E78', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyScore: { fontSize: 18, fontWeight: 'bold', color: ACCENT },
  historyCat: { fontSize: 12, color: '#7E7E78', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1D1D1C',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 12 },
  modalList: { maxHeight: 400 },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#444039' },
  modalItemText: { fontSize: 15, color: '#EEEDE0' },
  modalClose: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
