import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_LIGHT = '#888888';

type Notification = {
  id: string;
  type: 'session' | 'payment' | 'message' | 'system';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  route?: string;
};

export default function AstrologerNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Fetch recent chats as notifications
      const { data: chats } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const items: Notification[] = [];

      // Convert chats to notifications
      if (chats) {
        chats.forEach((chat) => {
          items.push({
            id: `chat-${chat.id}`,
            type: chat.status === 'active' ? 'session' : 'message',
            title: chat.status === 'active' ? 'New Session Request' : 'Session Ended',
            body: chat.status === 'active'
              ? `${chat.user_email.split('@')[0]} wants to connect with you`
              : `Session with ${chat.user_email.split('@')[0]} has ended`,
            read: chat.status !== 'active',
            created_at: chat.created_at,
            route: `/chat-room/${chat.id}`,
          });
        });
      }

      // Convert payments to notifications
      if (payments) {
        payments.forEach((pay) => {
          items.push({
            id: `pay-${pay.id}`,
            type: 'payment',
            title: 'Payment Received',
            body: `₹${pay.amount} received from ${pay.user_email.split('@')[0]}`,
            read: true,
            created_at: pay.created_at,
            route: '/astrologer-payments',
          });
        });
      }

      // Add system notifications
      items.push({
        id: 'welcome',
        type: 'system',
        title: 'Welcome to Koshmira!',
        body: 'Your profile is live. Clients can now find and connect with you.',
        read: false,
        created_at: new Date().toISOString(),
      });

      // Sort by date
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(items);
    } catch {
      // Silent fail
    }
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'session': return 'chatbubbles';
      case 'payment': return 'wallet';
      case 'message': return 'chatbubble';
      case 'system': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'session': return GREEN;
      case 'payment': return ACCENT;
      case 'message': return '#4FC3F7';
      case 'system': return '#BA68C8';
      default: return TEXT_MID;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Notifications</Text>
          <TouchableOpacity style={s.clearBtn}>
            <Text style={s.clearTxt}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {notifications.length === 0 && !loading ? (
            <View style={s.emptyCard}>
              <Ionicons name="notifications-off-outline" size={40} color={ACCENT} />
              <Text style={s.emptyTitle}>No Notifications</Text>
              <Text style={s.emptySub}>You're all caught up!</Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[s.notifCard, !item.read && s.notifUnread]}
                onPress={() => item.route && router.push(item.route as any)}
              >
              <View style={[s.notifIcon, { backgroundColor: getColor(item.type) + '18' }]}>
                <Ionicons name={getIcon(item.type) as any} size={20} color={getColor(item.type)} />
              </View>
              <View style={s.notifInfo}>
                <View style={s.notifTop}>
                  <Text style={s.notifTitle} numberOfLines={1}>{item.title}</Text>
                  {!item.read && <View style={s.unreadDot} />}
                </View>
                <Text style={s.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={s.notifTime}>{getTimeAgo(item.created_at)}</Text>
              </View>
              {item.route && (
                <Ionicons name="chevron-forward" size={16} color={TEXT_LIGHT} />
              )}
            </TouchableOpacity>
          ))
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
  scroll: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  clearTxt: { fontSize: 13, fontWeight: '500', color: ACCENT },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: BORDER,
  },
  notifUnread: { backgroundColor: '#FFFBF0', borderColor: ACCENT + '40' },
  notifIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT },
  notifBody: { fontSize: 12, color: TEXT_MID, marginTop: 3, lineHeight: 16 },
  notifTime: { fontSize: 10, color: TEXT_LIGHT, marginTop: 4 },

  emptyCard: { backgroundColor: CARD_BG, borderRadius: 16, padding: 40, borderWidth: 1, borderColor: BORDER, alignItems: 'center', gap: 8, marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: TEXT_DARK, marginTop: 8 },
  emptySub: { fontSize: 13, color: TEXT_MID },
});
