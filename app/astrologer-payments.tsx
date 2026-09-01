import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { listAstrologerPayments, type Payment } from '@/lib/chat';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';
const ORANGE = '#FFB74D';

type StatusTab = 'all' | 'pending' | 'settled';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AstrologerPaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [pickerMonth, setPickerMonth] = useState<number | null>(null);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);

  const myAstro = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [astrologers, user?.email],
  );

  useEffect(() => {
    if (!myAstro?.id) return;
    let active = true;
    (async () => {
      const p = await listAstrologerPayments(myAstro.id);
      if (active) setPayments(p);
    })();
    return () => { active = false; };
  }, [myAstro?.id]);

  const availableYears = useMemo(() => {
    return [new Date().getFullYear()];
  }, []);

  const filteredPayments = useMemo(() => {
    let result = payments;

    if (statusTab === 'pending') result = result.filter((p) => p.status === 'pending');
    if (statusTab === 'settled') result = result.filter((p) => p.status === 'paid');

    result = result.filter((p) => {
      const d = new Date(p.created_at ?? Date.now());
      if (d.getFullYear() !== pickerYear) return false;
      if (pickerMonth !== null && d.getMonth() !== pickerMonth) return false;
      return true;
    });

    return result;
  }, [payments, statusTab, pickerMonth, pickerYear]);

  const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const filteredTotal = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getStatusStyle = (status: string) => {
    if (status === 'paid') return { color: GREEN, label: 'Settled' };
    if (status === 'pending') return { color: ORANGE, label: 'Pending' };
    return { color: TEXT_DIM, label: status };
  };

  const displayLabel = pickerMonth !== null
    ? `${MONTHS[pickerMonth]} ${pickerYear}`
    : `All Months ${pickerYear}`;

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Earnings</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {/* Banner */}
            <View style={s.bannerWrap}>
              <ImageBackground
                source={require('../assets/astrologer-eranings.png')}
                style={s.banner}
                imageStyle={s.bannerImage}
                resizeMode="cover"
              >
                <View style={s.bannerOverlay}>
                  <Text style={s.bannerLabel}>Total Earnings</Text>
                  <Text style={s.bannerAmt}>₹{total}</Text>
                  <Text style={s.bannerSub}>{payments.length} transactions</Text>
                </View>
              </ImageBackground>
            </View>

            {/* Status Tabs */}
            <View style={s.tabRow}>
              {(['all', 'pending', 'settled'] as StatusTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[s.tab, statusTab === tab && s.tabActive]}
                  onPress={() => setStatusTab(tab)}
                >
                  <Text style={[s.tabTxt, statusTab === tab && s.tabTxtActive]}>
                    {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'Settled'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Month Picker Button */}
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar" size={18} color={ACCENT} />
              <Text style={s.pickerBtnTxt}>{displayLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={TEXT_MID} />
            </TouchableOpacity>

            {/* Filtered Total */}
            {(pickerMonth !== null || statusTab !== 'all') && (
              <View style={s.filteredRow}>
                <Text style={s.filteredLabel}>Filtered Total</Text>
                <Text style={s.filteredAmt}>₹{filteredTotal}</Text>
              </View>
            )}
          </>
        )}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.emptyCard}>
            <Ionicons name="wallet" size={28} color={ACCENT} />
            <Text style={s.emptyTxt}>No transactions found</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const status = getStatusStyle(item.status ?? 'paid');
          return (
            <View style={s.payCard}>
              <View style={s.payLeft}>
                <View style={[s.payIcon, { backgroundColor: status.color + '20' }]}>
                  <Ionicons name={item.status === 'pending' ? 'time' : 'checkmark-circle'} size={16} color={status.color} />
                </View>
                <View>
                  <Text style={s.payTitle}>{item.user_email?.split('@')[0] ?? 'User'}</Text>
                  <Text style={s.payDate}>{new Date(item.created_at ?? Date.now()).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={s.payRight}>
                <Text style={s.payAmt}>+₹{Number(item.amount) || 0}</Text>
                <Text style={[s.payStatus, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Month Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={s.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={22} color={TEXT_MID} />
              </TouchableOpacity>
            </View>

            {/* All Months */}
            <TouchableOpacity
              style={[s.monthAllBtn, pickerMonth === null && s.monthAllBtnActive]}
              onPress={() => setPickerMonth(null)}
            >
              <Text style={[s.monthAllTxt, pickerMonth === null && s.monthAllTxtActive]}>All Months ({new Date().getFullYear()})</Text>
            </TouchableOpacity>

            {/* Month Grid */}
            <View style={s.monthGrid}>
              {MONTHS.map((month, idx) => (
                <TouchableOpacity
                  key={month}
                  style={[s.monthCell, pickerMonth === idx && s.monthCellActive]}
                  onPress={() => setPickerMonth(idx)}
                >
                  <Text style={[s.monthCellTxt, pickerMonth === idx && s.monthCellTxtActive]}>{MONTHS_SHORT[idx]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Done Button */}
            <TouchableOpacity style={s.doneBtn} onPress={() => setShowPicker(false)}>
              <Text style={s.doneBtnTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  listContent: { padding: 16, paddingBottom: 30 },

  // Banner
  bannerWrap: { marginBottom: 16 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 120 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  bannerLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  bannerAmt: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Status Tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  tabActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  tabTxt: { fontSize: 12, fontWeight: '600', color: TEXT_MID },
  tabTxtActive: { color: '#fff' },

  // Picker Button
  pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD_BG, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 12 },
  pickerBtnTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: TEXT_DARK },

  // Filtered Total
  filteredRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  filteredLabel: { fontSize: 13, fontWeight: '500', color: TEXT_MID },
  filteredAmt: { fontSize: 18, fontWeight: 'bold', color: ACCENT },

  // Payment Card
  payCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  payDate: { fontSize: 11, color: TEXT_DIM, marginTop: 2 },
  payRight: { alignItems: 'flex-end' },
  payAmt: { fontSize: 15, fontWeight: '700', color: GREEN },
  payStatus: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  emptyCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 32, alignItems: 'center', gap: 8, marginTop: 30 },
  emptyTxt: { fontSize: 13, color: TEXT_MID },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  // Month Grid
  monthAllBtn: { paddingVertical: 12, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', marginBottom: 12 },
  monthAllBtnActive: { backgroundColor: TEXT_DARK, borderColor: TEXT_DARK },
  monthAllTxt: { fontSize: 14, fontWeight: '600', color: TEXT_MID },
  monthAllTxtActive: { color: '#fff' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  monthCell: { width: '22%', paddingVertical: 12, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  monthCellActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  monthCellTxt: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  monthCellTxtActive: { color: '#fff' },

  // Done Button
  doneBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  doneBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
