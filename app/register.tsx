import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
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

const ACCENT = '#B09C66';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  const register = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
            </TouchableOpacity>

            <View style={styles.logoWrap}>
              <View style={styles.logo}>
                <Ionicons name="sparkles" size={36} color="#ffffff" />
              </View>
              <ThemedText style={styles.formTitle}>Create Account</ThemedText>
              <ThemedText style={styles.formSubtitle}>
                Join My Astro and unlock your destiny
              </ThemedText>
            </View>

            <View style={styles.formCard}>
              <View style={styles.field}>
                <Ionicons name="person-outline" size={18} color="#7E7E78" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor="#7E7E78"
                />
              </View>

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color="#7E7E78" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#7E7E78"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={18} color="#7E7E78" />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#7E7E78"
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
                  <Ionicons
                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#7E7E78"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={18} color="#7E7E78" />
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Confirm Password"
                  placeholderTextColor="#7E7E78"
                  secureTextEntry={!showPw}
                />
              </View>

              <TouchableOpacity style={styles.btn} onPress={register}>
                <Ionicons name="person-add-outline" size={20} color="#ffffff" />
                <ThemedText style={styles.btnText}>Create Account</ThemedText>
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <ThemedText style={styles.muted}>Already have an account?</ThemedText>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <ThemedText style={styles.link}>Login</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingTop: 12 },
  backBtn: { alignSelf: 'flex-start', padding: 4, marginBottom: 8 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#EEEDE0' },
  formSubtitle: { fontSize: 13, color: '#7E7E78', marginTop: 4, marginBottom: 20 },
  formCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    padding: 24,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#EEEDE0' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 6,
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  muted: { fontSize: 14, color: '#7E7E78' },
  link: { fontSize: 14, color: ACCENT, fontWeight: '600' },
});
