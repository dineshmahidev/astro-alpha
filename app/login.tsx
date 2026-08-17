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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const login = () => {
    router.replace('/(tabs)');
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
            <View style={styles.logoWrap}>
              <View style={styles.logo}>
                <Ionicons name="planet" size={44} color="#ffffff" />
              </View>
              <ThemedText style={styles.appName}>My Astro</ThemedText>
              <ThemedText style={styles.tagline}>
                Your daily guide to the stars
              </ThemedText>
            </View>

            <View style={styles.formCard}>
              <ThemedText style={styles.formTitle}>Welcome Back</ThemedText>
              <ThemedText style={styles.formSubtitle}>
                Login to continue your cosmic journey
              </ThemedText>

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

              <TouchableOpacity
                onPress={() => router.push('/register')}
                style={styles.linkWrap}>
                <ThemedText style={styles.link}>Forgot password?</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btn} onPress={login}>
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                <ThemedText style={styles.btnText}>Login</ThemedText>
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <ThemedText style={styles.muted}>Don't have an account?</ThemedText>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <ThemedText style={styles.link}>Register</ThemedText>
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
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#EEEDE0', marginTop: 14 },
  tagline: { fontSize: 14, color: '#7E7E78', marginTop: 4 },
  formCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    padding: 24,
  },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },
  formSubtitle: { fontSize: 13, color: '#7E7E78', marginTop: 4, marginBottom: 20 },
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
  linkWrap: { alignItems: 'flex-end', marginBottom: 20 },
  link: { fontSize: 14, color: ACCENT, fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
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
});
