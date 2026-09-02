import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#B09C66';
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const GREEN = '#7BD88F';
const RED = '#EF5350';
const STORE_KEY = 'palm:history';

type PalmScan = {
  id: string;
  date: string;
  time: string;
  hand: 'right' | 'left';
  imageUri?: string;
  summary: string;
  traits: string[];
  lines: string[];
  chat?: { role: 'user' | 'assistant'; text: string }[];
};

export default function PalmHistoryScreen() {
  const router = useRouter();
  const [scans, setScans] = useState<PalmScan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((raw) => {
      if (raw) setScans(JSON.parse(raw));
    });
  }, []);

  const deleteScan = (id: string) => {
    Alert.alert('Delete', 'Remove this scan from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setScans((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all palm reading history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setScans([]) },
    ]);
  };

  // Group scans by date
  const grouped = scans.reduce<Record<string, PalmScan[]>>((acc, scan) => {
    const key = scan.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(scan);
    return acc;
  }, {});

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Palm Reading History</Text>
          {scans.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={clearAll}>
              <Text style={s.clearBtnTxt}>Clear</Text>
            </TouchableOpacity>
          )}
          {scans.length === 0 && <View style={{ width: 50 }} />}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {scans.length === 0 ? (
            <View style={s.emptyState}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="hand-left-outline" size={50} color={ACCENT} />
              </View>
              <Text style={s.emptyTitle}>No Readings Yet</Text>
              <Text style={s.emptyDesc}>Your palm reading history will appear here after your first scan.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.back()}>
                <Text style={s.emptyBtnTxt}>Start Scanning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.entries(grouped).map(([date, dateScans]) => {
              if (!dateScans || dateScans.length === 0) return null;
              return (
              <View key={date}>
                <Text style={s.dateLabel}>{date}</Text>
                {dateScans.map((scan) => {
                  const expanded = expandedId === scan.id;
                  return (
                    <View key={scan.id} style={s.scanCard}>
                      <TouchableOpacity
                        style={s.scanHeader}
                        onPress={() => setExpandedId(expanded ? null : scan.id)}
                      >
                        <View style={s.scanLeft}>
                          <View style={[s.handBadge, scan.hand === 'right' ? s.handRight : s.handLeft]}>
                            <Ionicons name="hand-left" size={16} color="#fff" />
                            <Text style={s.handBadgeTxt}>{scan.hand === 'right' ? 'Right' : 'Left'}</Text>
                          </View>
                          <View style={s.scanInfo}>
                            <Text style={s.scanTime}>{scan.time}</Text>
                            <Text style={s.scanSummary} numberOfLines={1}>{scan.summary}</Text>
                          </View>
                        </View>
                        <View style={s.scanRight}>
                          {scan.imageUri && (
                            <Image source={{ uri: scan.imageUri }} style={s.scanThumb} contentFit="cover" />
                          )}
                          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={TEXT_MID} />
                        </View>
                      </TouchableOpacity>

                      {expanded && (
                        <View style={s.scanExpanded}>
                          {/* Image */}
                          {scan.imageUri && (
                            <Image source={{ uri: scan.imageUri }} style={s.scanImage} contentFit="cover" />
                          )}

                          {/* Summary */}
                          <Text style={s.sectionLabel}>Summary</Text>
                          <Text style={s.summaryText}>{scan.summary}</Text>

                          {/* Traits */}
                          {scan.traits.length > 0 && (
                            <>
                              <Text style={s.sectionLabel}>Traits</Text>
                              <View style={s.chipRow}>
                                {scan.traits.map((tr, i) => (
                                  <View key={i} style={s.chip}>
                                    <Text style={s.chipTxt}>{tr}</Text>
                                  </View>
                                ))}
                              </View>
                            </>
                          )}

                          {/* Lines */}
                          {scan.lines.length > 0 && (
                            <>
                              <Text style={s.sectionLabel}>Palm Lines</Text>
                              <View style={s.chipRow}>
                                {scan.lines.map((ln, i) => (
                                  <View key={i} style={[s.chip, { backgroundColor: ACCENT + '15' }]}>
                                    <Text style={[s.chipTxt, { color: ACCENT }]}>{ln}</Text>
                                  </View>
                                ))}
                              </View>
                            </>
                          )}

                          {/* Chat Conversation */}
                          {scan.chat && scan.chat.length > 0 && (
                            <>
                              <Text style={s.sectionLabel}>Chat Conversation</Text>
                              <View style={s.chatContainer}>
                                {scan.chat.map((msg, i) => {
                                  const isUser = msg.role === 'user';
                                  return (
                                    <View key={i} style={[s.chatBubble, isUser ? s.chatUser : s.chatAssistant]}>
                                      {!isUser && <Ionicons name="sparkles" size={12} color={ACCENT} />}
                                      <Text style={[s.chatText, isUser ? s.chatTextUser : s.chatTextAssistant]}>
                                        {msg.text}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </>
                          )}

                          {/* Delete */}
                          <TouchableOpacity style={s.deleteBtn} onPress={() => deleteScan(scan.id)}>
                            <Ionicons name="trash-outline" size={16} color={RED} />
                            <Text style={s.deleteBtnTxt}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              );
            })
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
  scroll: { paddingHorizontal: 16 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: RED + '15' },
  clearBtnTxt: { fontSize: 13, fontWeight: '600', color: RED },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: TEXT_MID, textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  emptyBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Date
  dateLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MID, marginTop: 16, marginBottom: 8, paddingLeft: 4 },

  // Scan Card
  scanCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 10, overflow: 'hidden' },
  scanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  scanLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  handBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  handRight: { backgroundColor: '#2196F3' },
  handLeft: { backgroundColor: '#E91E63' },
  handBadgeTxt: { fontSize: 11, fontWeight: '600', color: '#fff' },
  scanInfo: { flex: 1 },
  scanTime: { fontSize: 12, color: TEXT_MID },
  scanSummary: { fontSize: 13, fontWeight: '500', color: TEXT_DARK, marginTop: 2 },
  scanRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanThumb: { width: 40, height: 40, borderRadius: 8 },

  // Expanded
  scanExpanded: { paddingHorizontal: 14, paddingBottom: 14 },
  scanImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginTop: 12, marginBottom: 6 },
  summaryText: { fontSize: 13, color: TEXT_MID, lineHeight: 19 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: CARD_BG, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: BORDER },
  chipTxt: { fontSize: 12, color: TEXT_DARK },

  // Chat
  chatContainer: { gap: 8, marginTop: 4 },
  chatBubble: { flexDirection: 'row', gap: 6, maxWidth: '90%', padding: 10, borderRadius: 12 },
  chatUser: { alignSelf: 'flex-end', backgroundColor: ACCENT, borderBottomRightRadius: 4 },
  chatAssistant: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: BORDER },
  chatText: { fontSize: 12, lineHeight: 17, flex: 1 },
  chatTextUser: { color: '#FFFFFF' },
  chatTextAssistant: { color: TEXT_DARK },

  // Delete
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-end' },
  deleteBtnTxt: { fontSize: 12, fontWeight: '500', color: RED },
});
