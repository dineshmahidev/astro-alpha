import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const RED = '#E57373';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';

const AMOUNTS = [20, 50, 100, 150, 200];
const HISTORY_KEY = '@wallet_history';

type HistoryItem = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  label: string;
  date: string;
};

export default function TopupScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  };

  const saveHistory = async (item: HistoryItem) => {
    const updated = [item, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handlePay = async () => {
    const amt = selected ?? parseInt(custom, 10);
    if (!amt || amt < 1) return;
    const item: HistoryItem = {
      id: Date.now().toString(),
      amount: amt,
      type: 'credit',
      label: 'Wallet Top Up',
      date: new Date().toISOString(),
    };
    await saveHistory(item);
    setSelected(null);
    setCustom('');
    alert(`₹${amt} added to wallet`);
  };

  const total = (selected ?? parseInt(custom, 10)) || 0;

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Wallet</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'topup' && s.tabActive]}
            onPress={() => setActiveTab('topup')}
          >
            <Text style={[s.tabTxt, activeTab === 'topup' && s.tabTxtActive]}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'history' && s.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[s.tabTxt, activeTab === 'history' && s.tabTxtActive]}>History</Text>
            {history.length > 0 && (
              <View style={s.tabBadge}>
                <Text style={s.tabBadgeTxt}>{history.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {activeTab === 'topup' ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={() => (
            <>
              {/* Balance */}
              <View style={s.balanceCard}>
                <Text style={s.balanceLabel}>Current Balance</Text>
                <Text style={s.balanceAmt}>₹300</Text>
              </View>

              {/* Amount Grid */}
              <Text style={s.section}>Select Amount</Text>
              <View style={s.amountGrid}>
                {AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[s.amountCard, selected === amt && s.amountActive]}
                    onPress={() => { setSelected(amt); setCustom(''); }}
                  >
                    <Text style={[s.amountText, selected === amt && s.amountTextActive]}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount */}
              <Text style={s.section}>Or Enter Custom Amount</Text>
              <View style={s.customWrap}>
                <Text style={s.rupeeSign}>₹</Text>
                <TextInput
                  style={s.customInput}
                  placeholder="Enter amount"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                  value={custom}
                  onChangeText={(t) => { setCustom(t); setSelected(null); }}
                />
              </View>

              {/* Summary */}
              {total > 0 && (
                <View style={s.summary}>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Amount</Text>
                    <Text style={s.summaryValue}>₹{total}</Text>
                  </View>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Bonus</Text>
                    <Text style={[s.summaryValue, { color: GREEN }]}>₹0</Text>
                  </View>
                  <View style={s.divider} />
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabelTotal}>You Pay</Text>
                    <Text style={s.summaryTotal}>₹{total}</Text>
                  </View>
                </View>
              )}

              {/* Pay Button */}
              <TouchableOpacity
                style={[s.payBtn, total < 1 && s.payBtnDisabled]}
                onPress={handlePay}
                disabled={total < 1}
              >
                <Text style={s.payBtnText}>Pay ₹{total || 0}</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </>
          )}
          keyExtractor={() => 'dummy'}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={40} color="#CCCCCC" />
              <Text style={s.emptyTxt}>No transactions yet</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isCredit = item.type === 'credit';
            return (
              <View style={s.historyCard}>
                <View style={[s.historyIcon, { backgroundColor: (isCredit ? GREEN : RED) + '15' }]}>
                  <Ionicons name={isCredit ? 'add-circle' : 'remove-circle'} size={20} color={isCredit ? GREEN : RED} />
                </View>
                <View style={s.historyInfo}>
                  <Text style={s.historyLabel}>{item.label}</Text>
                  <Text style={s.historyDate}>{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={[s.historyAmt, { color: isCredit ? GREEN : RED }]}>
                  {isCredit ? '+' : '-'}₹{item.amount}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: ACCENT },
  tabTxt: { fontSize: 14, fontWeight: '500', color: TEXT_DIM },
  tabTxtActive: { color: ACCENT, fontWeight: '700' },
  tabBadge: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Balance
  balanceCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#1D1D1C', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6 },
  balanceLabel: { fontSize: 13, color: '#7E7E78' },
  balanceAmt: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },

  section: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },

  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  amountCard: { width: '30%', backgroundColor: CARD_BG, borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  amountActive: { borderColor: ACCENT, backgroundColor: 'rgba(176,156,102,0.08)' },
  amountText: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  amountTextActive: { color: ACCENT },

  customWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: CARD_BG, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: BORDER },
  rupeeSign: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginRight: 8 },
  customInput: { flex: 1, fontSize: 16, color: TEXT_DARK, paddingVertical: 14 },

  summary: { marginHorizontal: 16, marginTop: 24, backgroundColor: CARD_BG, borderRadius: 14, padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: TEXT_MID },
  summaryValue: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  divider: { height: 1, backgroundColor: '#E0E0E0' },
  summaryLabelTotal: { fontSize: 15, fontWeight: '600', color: TEXT_DARK },
  summaryTotal: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  payBtn: { marginHorizontal: 16, marginTop: 20, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // History
  listContent: { padding: 16, paddingBottom: 30 },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  historyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  historyDate: { fontSize: 11, color: TEXT_DIM, marginTop: 2 },
  historyAmt: { fontSize: 16, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt: { fontSize: 14, color: TEXT_MID },
});
