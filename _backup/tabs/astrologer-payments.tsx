import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { listAstrologerPayments, type Payment } from '@/lib/chat';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const RED = '#E57373';
const CARD_BG = 'rgba(29,29,28,0.7)';
const BORDER = 'rgba(176,156,102,0.35)';

export default function AstrologerPaymentsScreen() {
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const myAstroId = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase())?.id ?? '',
    [astrologers, user?.email],
  );

  useEffect(() => {
    if (!myAstroId) return;
    let active = true;
    (async () => {
      const p = await listAstrologerPayments(myAstroId);
      if (!active) return;
      setPayments(p);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [myAstroId]);

  const totalEarnings = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEarnings = payments
    .filter((p) => new Date(p.created_at) >= todayStart)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEarnings = payments
    .filter((p) => new Date(p.created_at) >= weekStart)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Simulate pending = recent paid in last 24h not yet "settled"
  const pendingThreshold = new Date();
  pendingThreshold.setHours(pendingThreshold.getHours() - 24);
  const pendingAmount = payments
    .filter((p) => new Date(p.created_at) >= pendingThreshold)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const settledAmount = totalEarnings - pendingAmount;

  const userNameFor = (email: string) => {
    const name = email.split('@')[0].replace(/[._-]+/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const groupByDate = (items: Payment[]) => {
    const groups: { label: string; data: Payment[] }[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const item of items) {
      const d = new Date(item.created_at);
      let label: string;
      if (d.toDateString() === todayStr) label = 'Today';
      else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
      else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      const existing = groups.find((g) => g.label === label);
      if (existing) existing.data.push(item);
      else groups.push({ label, data: [item] });
    }
    return groups;
  };

  const grouped = groupByDate(payments);

  return (
    <ThemedView style={s.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <ThemedText style={s.headerTitle}>Earnings</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Total Earnings Card */}
          <View style={s.totalCard}>
            <View style={s.totalBg} />
            <ThemedText style={s.totalLabel}>Total Earnings</ThemedText>
            <ThemedText style={s.totalAmount}>₹{totalEarnings}</ThemedText>
            <View style={s.totalDivider} />
            <View style={s.totalRow}>
              <View style={s.totalItem}>
                <ThemedText style={s.totalItemLabel}>Today</ThemedText>
                <ThemedText style={s.totalItemValue}>₹{todayEarnings}</ThemedText>
              </View>
              <View style={s.totalVerticalDivider} />
              <View style={s.totalItem}>
                <ThemedText style={s.totalItemLabel}>This Week</ThemedText>
                <ThemedText style={s.totalItemValue}>₹{weekEarnings}</ThemedText>
              </View>
            </View>
          </View>

          {/* Settlement Status */}
          <View style={s.settlementRow}>
            <View style={s.settlementCard}>
              <View style={[s.settlementIcon, { backgroundColor: 'rgba(229,115,115,0.12)' }]}>
                <Ionicons name="hourglass" size={18} color={RED} />
              </View>
              <View style={s.settlementInfo}>
                <ThemedText style={s.settlementLabel}>Pending</ThemedText>
                <ThemedText style={s.settlementValue}>₹{pendingAmount}</ThemedText>
                <ThemedText style={s.settlementSub}>Within 24 hours</ThemedText>
              </View>
            </View>
            <View style={s.settlementCard}>
              <View style={[s.settlementIcon, { backgroundColor: 'rgba(123,216,143,0.12)' }]}>
                <Ionicons name="checkmark-circle" size={18} color={GREEN} />
              </View>
              <View style={s.settlementInfo}>
                <ThemedText style={s.settlementLabel}>Settled</ThemedText>
                <ThemedText style={[s.settlementValue, { color: GREEN }]}>₹{settledAmount}</ThemedText>
                <ThemedText style={s.settlementSub}>Credited to wallet</ThemedText>
              </View>
            </View>
          </View>

          {/* Payout Info */}
          <View style={s.payoutCard}>
            <View style={s.payoutLeft}>
              <Ionicons name="card" size={20} color={ACCENT} />
              <View>
                <ThemedText style={s.payoutTitle}>Automatic Payout</ThemedText>
                <ThemedText style={s.payoutSub}>Settled amount credited every 7 days</ThemedText>
              </View>
            </View>
            <Ionicons name="information-circle" size={18} color="#7E7E78" />
          </View>

          {/* Payment History */}
          <ThemedText style={s.sectionTitle}>Payment History</ThemedText>
          {loading ? (
            <ThemedText style={s.empty}>Loading…</ThemedText>
          ) : payments.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="receipt-outline" size={44} color="rgba(176,156,102,0.3)" />
              <ThemedText style={s.emptyTitle}>No Payments Yet</ThemedText>
              <ThemedText style={s.emptySub}>Payment records will appear here once users start chatting</ThemedText>
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.label} style={s.group}>
                <ThemedText style={s.groupLabel}>{group.label}</ThemedText>
                {group.data.map((p) => (
                  <View key={p.id} style={s.payCard}>
                    <View style={s.payLeft}>
                      <View style={s.payAvatar}>
                        <Ionicons name="person" size={16} color="#ffffff" />
                      </View>
                      <View style={s.payInfo}>
                        <ThemedText style={s.payName}>{userNameFor(p.user_email)}</ThemedText>
                        <ThemedText style={s.payTime}>
                          {new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={s.payRight}>
                      <ThemedText style={s.payAmount}>+₹{p.amount}</ThemedText>
                      <View style={s.paidBadge}>
                        <ThemedText style={s.paidText}>Paid</ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },

  // Total Card
  totalCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  totalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(176,156,102,0.06)',
  },
  totalLabel: { fontSize: 13, color: '#7E7E78', textAlign: 'center' },
  totalAmount: { fontSize: 36, fontWeight: 'bold', color: '#EEEDE0', textAlign: 'center', marginTop: 4 },
  totalDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 16,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center' },
  totalItem: { flex: 1, alignItems: 'center', gap: 4 },
  totalItemLabel: { fontSize: 12, color: '#7E7E78' },
  totalItemValue: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  totalVerticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: BORDER,
  },

  // Settlement
  settlementRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  settlementCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  settlementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settlementInfo: { flex: 1, gap: 2 },
  settlementLabel: { fontSize: 11, color: '#7E7E78', textTransform: 'uppercase', letterSpacing: 0.5 },
  settlementValue: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  settlementSub: { fontSize: 10, color: '#5A5A54' },

  // Payout Info
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payoutTitle: { fontSize: 13, fontWeight: '600', color: '#EEEDE0' },
  payoutSub: { fontSize: 11, color: '#7E7E78', marginTop: 2 },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EEEDE0',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },

  // Group
  group: { marginBottom: 12 },
  groupLabel: {
    fontSize: 12,
    color: '#7E7E78',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Payment Card
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.15)',
  },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: { gap: 2 },
  payName: { fontSize: 14, fontWeight: '600', color: '#EEEDE0' },
  payTime: { fontSize: 11, color: '#7E7E78' },
  payRight: { alignItems: 'flex-end', gap: 4 },
  payAmount: { fontSize: 16, fontWeight: 'bold', color: GREEN },
  paidBadge: {
    backgroundColor: 'rgba(123,216,143,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paidText: { fontSize: 10, color: GREEN, fontWeight: '600' },

  // Empty
  emptyCard: {
    alignItems: 'center',
    padding: 36,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#7E7E78' },
  emptySub: { fontSize: 12, color: '#5A5A54', textAlign: 'center' },
  empty: { fontSize: 14, color: '#7E7E78', textAlign: 'center', paddingVertical: 20 },
});
