import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useAuth, isAstrologer } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { GENDERS } from '@/constants/birth';
import { ZODIAC_SIGNS } from '@/constants/zodiac';
import { computeVedicChart } from '@/lib/vedic';

const ACCENT = '#B09C66';
const BG = '#FFFFFF';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';
const { width: W } = Dimensions.get('window');

const NOW = new Date();

const STEPS = [
  { key: 'name', title: 'Your Name', titleTa: 'உங்கள் பெயர்', subtitle: 'Tell us who you are', img: require('../assets/onboard/gender_onboard.png') },
  { key: 'gender', title: 'Gender', titleTa: 'பாலினம்', subtitle: 'Select your gender', img: require('../assets/onboard/gender_onboard.png') },
  { key: 'dob', title: 'Date of Birth', titleTa: 'பிறந்த தேதி', subtitle: 'Tap to select your birth date', img: require('../assets/onboard/date_onboard.png') },
  { key: 'tob', title: 'Time of Birth', titleTa: 'பிறந்த நேரம்', subtitle: 'Tap to set your birth time', img: require('../assets/onboard/time_onboard.png') },
  { key: 'place', title: 'Birth Place', titleTa: 'பிறந்த இடம்', subtitle: 'Where were you born?', img: require('../assets/onboard/place_onboard.png') },
];

/* ─── Digital Time Picker Modal ─── */
function DigitalTimePicker({ visible, onDone, initial }: { visible: boolean; onDone: (h: number, m: number, period: string) => void; initial: { h: number; m: number; period: string } }) {
  const [h, setH] = useState(initial.h);
  const [m, setM] = useState(initial.m);
  const [period, setPeriod] = useState(initial.period);
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const mins = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dt.overlay}>
        <View style={dt.sheet}>
          <View style={dt.header}>
            <Text style={dt.title}>Select Time</Text>
            <TouchableOpacity onPress={() => onDone(h, m, period)}>
              <Text style={dt.done}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Digital Display */}
          <View style={dt.display}>
            <Text style={dt.displayNum}>{String(h12).padStart(2, '0')}</Text>
            <Text style={dt.displayColon}>:</Text>
            <Text style={dt.displayNum}>{String(m).padStart(2, '0')}</Text>
            <View style={dt.periodBtns}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity key={p} style={[dt.periodBtn, period === p && dt.periodActive]} onPress={() => setPeriod(p)}>
                  <Text style={[dt.periodTxt, period === p && period === 'AM' ? dt.periodAM : period === p && period === 'PM' ? dt.periodPM : null]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Scrollable Number Pickers */}
          <View style={dt.wheels}>
            <View style={dt.wheelCol}>
              <TouchableOpacity style={dt.adjBtn} onPress={() => setH(h12 >= 12 ? 1 : h12 + 1)}>
                <Ionicons name="chevron-up" size={22} color={ACCENT} />
              </TouchableOpacity>
              <Text style={dt.wheelNum}>{String(h12).padStart(2, '0')}</Text>
              <TouchableOpacity style={dt.adjBtn} onPress={() => setH(h12 <= 1 ? 12 : h12 - 1)}>
                <Ionicons name="chevron-down" size={22} color={ACCENT} />
              </TouchableOpacity>
            </View>

            <Text style={dt.colon}>:</Text>

            <View style={dt.wheelCol}>
              <TouchableOpacity style={dt.adjBtn} onPress={() => setM(m >= 59 ? 0 : m + 1)}>
                <Ionicons name="chevron-up" size={22} color={ACCENT} />
              </TouchableOpacity>
              <Text style={dt.wheelNum}>{String(m).padStart(2, '0')}</Text>
              <TouchableOpacity style={dt.adjBtn} onPress={() => setM(m <= 0 ? 59 : m - 1)}>
                <Ionicons name="chevron-down" size={22} color={ACCENT} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Minutes */}
          <View style={dt.quickRow}>
            {[0, 15, 30, 45].map((qm) => (
              <TouchableOpacity key={qm} style={[dt.quickBtn, m === qm && dt.quickActive]} onPress={() => setM(qm)}>
                <Text style={[dt.quickTxt, m === qm && dt.quickTxtActive]}>{String(qm).padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Main ─── */
export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  // DOB
  const [dobDate, setDobDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dob = `${String(dobDate.getDate()).padStart(2, '0')}/${String(dobDate.getMonth() + 1).padStart(2, '0')}/${dobDate.getFullYear()}`;

  // TOB
  const [tobHour, setTobHour] = useState(12);
  const [tobMin, setTobMin] = useState(0);
  const [tobPeriod, setTobPeriod] = useState('AM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const tobH24 = tobPeriod === 'AM' ? (tobHour === 12 ? 0 : tobHour) : (tobHour === 12 ? 12 : tobHour + 12);
  const tob = `${String(tobH24).padStart(2, '0')}:${String(tobMin).padStart(2, '0')}`;

  // Place
  const [place, setPlace] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Result
  const [showResult, setShowResult] = useState(false);
  const [vedicChart, setVedicChart] = useState<ReturnType<typeof computeVedicChart> | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnims = useRef(STEPS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const panX = useRef(new Animated.Value(0)).current;

  const searchPlace = (q: string) => {
    setPlaceQuery(q);
    setPlace('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setPlaceResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8`, {
          headers: { 'User-Agent': 'KoshmiraApp/1.0' },
        });
        setPlaceResults(await res.json());
      } catch { setPlaceResults([]); }
      setPlaceLoading(false);
    }, 400);
  };

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setDobDate(date);
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const canNext = () => {
    const k = STEPS[step].key;
    if (k === 'name') return name.trim().length > 0;
    if (k === 'gender') return gender.length > 0;
    if (k === 'dob' || k === 'tob') return true;
    if (k === 'place') return place.length > 0;
    return false;
  };

  const goNext = () => {
    if (step >= STEPS.length - 1) { saveAndGo(); return; }
    const ns = step + 1;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -W, duration: 300, useNativeDriver: true }),
      Animated.timing(progressAnims[step], { toValue: 0, duration: 300, useNativeDriver: false }),
      Animated.timing(progressAnims[ns], { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start(() => { setStep(ns); slideAnim.setValue(W); Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(); });
  };

  const goPrev = () => {
    if (step <= 0) return;
    const ns = step - 1;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: W, duration: 300, useNativeDriver: true }),
      Animated.timing(progressAnims[step], { toValue: 0, duration: 300, useNativeDriver: false }),
      Animated.timing(progressAnims[ns], { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start(() => { setStep(ns); slideAnim.setValue(-W); Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(); });
  };

  const saveAndGo = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    await AsyncStorage.setItem('onboarding_data', JSON.stringify({ name: name.trim(), gender, dob, tob, place }));
    const fullDate = new Date(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate(), tobH24, tobMin);
    const tobDate = new Date(1995, 0, 1, tobH24, tobMin);
    // Save to auth context so match-result and other screens can use it
    await saveBirthDetails({
      name: name.trim(),
      gender: gender as 'male' | 'female' | 'other',
      dob,
      dobDate: fullDate,
      tob,
      tobDate,
      tobKnown: true,
      place,
    });
    const chart = computeVedicChart(fullDate);
    setVedicChart(chart);
    setShowResult(true);
  };

  const { role, saveBirthDetails } = useAuth();
  const goToHome = () => {
    router.replace(isAstrologer(role) ? '/astrologer' : '/consumer');
  };

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>([{ nativeEvent: { translationX: panX } }], { useNativeDriver: true });
  const onHandlerStateChange = (e: { nativeEvent: { state: number; translationX: number } }) => {
    if (e.nativeEvent.state === State.END) {
      if (e.nativeEvent.translationX < -50) goNext();
      else if (e.nativeEvent.translationX > 50) goPrev();
      Animated.spring(panX, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const cur = STEPS[step];

  return (
    <GestureHandlerRootView style={s.root}>
      <View style={s.screen}>
        <SafeAreaView style={s.safe} edges={['top']}>
          <View style={s.progressRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={s.progressTrack}>
                <Animated.View style={[s.progressFill, { width: progressAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              </View>
            ))}
          </View>
          <Text style={s.stepCount}>Step {step + 1} of {STEPS.length}</Text>
        </SafeAreaView>

        <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
          <Animated.View style={[s.content, { transform: [{ translateX: Animated.add(slideAnim, panX) }] }]}>
            <View style={s.imgWrap}>
              <Image source={cur.img} style={s.stepImg} contentFit="contain" />
            </View>
            <Text style={s.title}>{cur.title}</Text>
            <Text style={s.titleTa}>{cur.titleTa}</Text>
            <Text style={s.sub}>{cur.subtitle}</Text>

            <View style={s.inputArea}>
              {cur.key === 'name' && (
                <TextInput style={s.textInput} placeholder="Enter your name" placeholderTextColor={TEXT_DIM} value={name} onChangeText={setName} autoFocus />
              )}

              {cur.key === 'gender' && (
                <View style={s.genderRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity key={g.id} style={[s.genderBtn, gender === g.id && s.genderActive]} onPress={() => setGender(g.id)}>
                      <Ionicons name={g.id === 'male' ? 'male' : g.id === 'female' ? 'female' : 'male-female'} size={22} color={gender === g.id ? '#fff' : ACCENT} />
                      <Text style={[s.genderTxt, gender === g.id && s.genderTxtActive]}>{g.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {cur.key === 'dob' && (
                <TouchableOpacity style={s.inputField} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={ACCENT} />
                  <Text style={s.inputTxtSet}>{dob}</Text>
                  <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
                </TouchableOpacity>
              )}

              {cur.key === 'tob' && (
                <TouchableOpacity style={s.inputField} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color={ACCENT} />
                  <Text style={s.inputTxtSet}>{tobHour > 0 || tobMin > 0 ? `${String(tobHour).padStart(2, '0')}:${String(tobMin).padStart(2, '0')} ${tobPeriod}` : 'Tap to select time'}</Text>
                  <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
                </TouchableOpacity>
              )}

              {cur.key === 'place' && (
                <View>
                  <TextInput style={s.textInput} placeholder="Search city..." placeholderTextColor={TEXT_DIM} value={placeQuery} onChangeText={searchPlace} autoFocus />
                  {placeLoading && <ActivityIndicator size="small" color={ACCENT} style={{ marginTop: 8 }} />}
                  {placeResults.length > 0 && !place && (
                    <FlatList data={placeResults} keyExtractor={(_, i) => String(i)} style={s.placeDrop} nestedScrollEnabled
                      renderItem={({ item }) => (
                        <TouchableOpacity style={s.placeItem} onPress={() => { setPlace(item.display_name); setPlaceQuery(item.display_name); setPlaceResults([]); }}>
                          <Ionicons name="location-outline" size={16} color={ACCENT} />
                          <Text style={s.placeTxt} numberOfLines={2}>{item.display_name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </PanGestureHandler>

        <SafeAreaView style={s.btmSafe} edges={['bottom']}>
          <View style={s.btmRow}>
            <View style={s.dots}>{STEPS.map((_, i) => <View key={i} style={[s.dot, i === step && s.dotOn]} />)}</View>
            <View style={s.arrows}>
              {step > 0 && <TouchableOpacity style={s.arrow} onPress={goPrev}><Ionicons name="chevron-back" size={20} color={ACCENT} /></TouchableOpacity>}
              <TouchableOpacity style={[s.arrow, s.arrowPri, !canNext() && s.arrowDis]} onPress={() => canNext() && goNext()}>
                <Ionicons name={step >= STEPS.length - 1 ? 'checkmark' : 'chevron-forward'} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Native Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={onDateChange}
          />
        )}

        {/* Digital Time Picker */}
        <DigitalTimePicker
          visible={showTimePicker}
          initial={{ h: tobHour, m: tobMin, period: tobPeriod }}
          onDone={(h, m, p) => { setTobHour(h); setTobMin(m); setTobPeriod(p); setShowTimePicker(false); }}
        />

        {/* Result Screen */}
        {showResult && vedicChart && (
          <View style={res.overlay}>
            <View style={res.card}>
              <Image source={ZODIAC_SIGNS[vedicChart.rashiIndex].image} style={res.zodiacImg} contentFit="contain" />
              <Text style={res.hi}>Hi, {name.trim()}!</Text>
              <Text style={res.emoji}>{ZODIAC_SIGNS[vedicChart.rashiIndex].emoji}</Text>

              <View style={res.divider} />

              <View style={res.row}>
                <Text style={res.label}>Your Rasi</Text>
                <Text style={res.value}>{vedicChart.rashi}</Text>
                <Text style={res.explain}>Moon is in the {vedicChart.rashi} constellation. This defines your emotional core and personality.</Text>
              </View>

              <View style={res.row}>
                <Text style={res.label}>Your Star</Text>
                <Text style={res.value}>{vedicChart.nakshatra} (Pada {vedicChart.pada})</Text>
                <Text style={res.explain}>Born under {vedicChart.nakshatra} nakshatra, ruled by {vedicChart.nakshatraLord}. This shapes your destiny and life path.</Text>
              </View>

              <View style={res.calcBox}>
                <Ionicons name="calculator-outline" size={14} color={ACCENT} />
                <Text style={res.calcTxt}>
                  Calculated using Lahiri ayanamsa from your DOB {dob} & TOB {tob}. Moon tropical longitude converted to sidereal → Rasi & Nakshatra derived.
                </Text>
              </View>

              <TouchableOpacity style={res.btn} onPress={goToHome}>
                <Ionicons name="rocket-outline" size={18} color="#fff" />
                <Text style={res.btnTxt}>Koshmira says — explore your cosmos!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: BG },
  safe: { paddingHorizontal: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(176,156,102,0.2)', overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: ACCENT },
  stepCount: { fontSize: 12, color: TEXT_DIM, textAlign: 'right', marginTop: 4, paddingHorizontal: 20 },

  content: { flex: 1, paddingHorizontal: 20 },
  imgWrap: { width: '100%', height: '45%', alignItems: 'center', justifyContent: 'center' },
  stepImg: { width: '80%', height: '100%' },
  title: { fontSize: 22, fontWeight: 'bold', color: TEXT_DARK, textAlign: 'center' },
  titleTa: { fontSize: 14, color: ACCENT, textAlign: 'center', marginTop: 2, fontStyle: 'italic' },
  sub: { fontSize: 13, color: TEXT_MID, textAlign: 'center', marginTop: 6, marginBottom: 16 },

  inputArea: { flex: 1 },
  textInput: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: TEXT_DARK },

  inputField: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputTxtSet: { flex: 1, fontSize: 18, fontWeight: '600', color: TEXT_DARK },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', paddingVertical: 18, gap: 6 },
  genderActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  genderTxt: { fontSize: 13, fontWeight: '600', color: TEXT_MID },
  genderTxtActive: { color: '#fff' },

  placeDrop: { maxHeight: 200, backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, marginTop: 6 },
  placeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  placeTxt: { fontSize: 13, color: TEXT_DARK, flex: 1 },

  btmSafe: { paddingHorizontal: 20 },
  btmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(176,156,102,0.25)' },
  dotOn: { backgroundColor: ACCENT, width: 24 },
  arrows: { flexDirection: 'row', gap: 10 },
  arrow: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  arrowPri: { backgroundColor: ACCENT, borderColor: ACCENT },
  arrowDis: { opacity: 0.35 },
});

/* ─── Digital Time Picker Styles ─── */
const dt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  title: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  done: { fontSize: 16, fontWeight: '600', color: ACCENT },

  display: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 4 },
  displayNum: { fontSize: 48, fontWeight: 'bold', color: TEXT_DARK, minWidth: 70, textAlign: 'center' },
  displayColon: { fontSize: 42, fontWeight: 'bold', color: ACCENT },
  periodBtns: { flexDirection: 'column', gap: 6, marginLeft: 12 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG },
  periodActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  periodTxt: { fontSize: 13, fontWeight: '700', color: TEXT_MID },
  periodAM: { color: '#fff' },
  periodPM: { color: '#fff' },

  wheels: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  wheelCol: { alignItems: 'center', gap: 4 },
  adjBtn: { width: 50, height: 40, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  wheelNum: { fontSize: 28, fontWeight: 'bold', color: TEXT_DARK, minWidth: 50, textAlign: 'center' },
  colon: { fontSize: 32, fontWeight: 'bold', color: ACCENT, marginTop: 16 },

  quickRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  quickBtn: { width: 56, height: 36, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  quickActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  quickTxt: { fontSize: 14, fontWeight: '600', color: TEXT_MID },
  quickTxtActive: { color: '#fff' },
});

const res = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 100, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  zodiacImg: { width: 100, height: 100, marginBottom: 8 },
  hi: { fontSize: 26, fontWeight: 'bold', color: TEXT_DARK },
  emoji: { fontSize: 32, marginTop: 4 },
  divider: { width: 50, height: 2, backgroundColor: ACCENT, marginVertical: 16 },
  row: { width: '100%', marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: ACCENT, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginTop: 2 },
  explain: { fontSize: 12, color: TEXT_MID, marginTop: 4, lineHeight: 17 },
  calcBox: { flexDirection: 'row', gap: 6, backgroundColor: CARD_BG, borderRadius: 10, padding: 10, marginTop: 8, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  calcTxt: { flex: 1, fontSize: 11, color: TEXT_MID, lineHeight: 16 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, width: '100%', justifyContent: 'center' },
  btnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
