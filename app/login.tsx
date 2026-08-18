import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, birthDetails, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogle = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signIn();
      router.replace(birthDetails ? '/(tabs)' : '/onboarding');
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Ionicons name="planet" size={44} color="#ffffff" />
            </View>
            <ThemedText style={styles.appName}>My Astro</ThemedText>
            <ThemedText style={styles.tagline}>
              Your daily guide to the stars
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Welcome to My Astro</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Sign in with Google to begin your cosmic journey
            </ThemedText>

            <TouchableOpacity
              style={[styles.googleBtn, signingIn && styles.googleBtnBusy]}
              onPress={handleGoogle}
              disabled={signingIn || loading}>
              {signingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#ffffff" />
                  <ThemedText style={styles.googleBtnText}>
                    Continue with Google
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <ThemedText style={styles.privacy}>
              By continuing you agree to our Terms & Privacy Policy
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
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
  card: {
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    padding: 24,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },
  cardSubtitle: { fontSize: 13, color: '#7E7E78', marginTop: 4, marginBottom: 24 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 15,
  },
  googleBtnBusy: { opacity: 0.7 },
  googleBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  privacy: {
    fontSize: 12,
    color: '#7E7E78',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
  },
});