import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();

  const [name, setName] = useState(user?.name ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.avatar) setAvatar(user.avatar);
  }, [user?.name, user?.avatar]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('profiles')
          .upsert({ id: authUser.id, name: name.trim(), avatar: avatar.trim() }, { onConflict: 'id' });
        Alert.alert('Saved', 'Profile updated');
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Failed to save');
    }
    setSaving(false);
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
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={s.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <Avatar uri={avatar} name={name} size={80} color={ACCENT} />
          <TouchableOpacity style={s.changeBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={s.changeTxt}>Change Photo</Text>
          </TouchableOpacity>
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

        {/* Birth Details - Clickable to Onboarding */}
        <TouchableOpacity style={s.birthCard} onPress={() => router.push('/onboarding')}>
          <View style={s.birthLeft}>
            <View style={s.birthIcon}>
              <Ionicons name="star-outline" size={20} color={ACCENT} />
            </View>
            <View style={s.birthInfo}>
              <Text style={s.birthTitle}>Birth Details</Text>
              <Text style={s.birthSub}>Edit name, gender, DOB, time & place</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={ACCENT} />
        </TouchableOpacity>

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

  avatarSection: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  changeTxt: { fontSize: 13, fontWeight: '600', color: '#fff' },

  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, paddingVertical: 14 },
  label: { fontSize: 12, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { fontSize: 15, color: TEXT_DARK, padding: 0 },

  birthCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  birthLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  birthIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: ACCENT + '15', alignItems: 'center', justifyContent: 'center' },
  birthInfo: { flex: 1 },
  birthTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  birthSub: { fontSize: 12, color: TEXT_DIM, marginTop: 2 },
});
