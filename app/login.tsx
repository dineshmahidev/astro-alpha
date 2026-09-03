import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { uiStrings } from '@/constants/ui-strings';
import { isAstrologer, useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';

export default function LoginScreen() {
  const router = useRouter();
  const { user, birthDetails, role, language, loading, resolving, signIn } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const t = uiStrings(language).t;

  const handleGoogle = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      const { role: resolvedRole } = await signIn();
      const dest = isAstrologer(resolvedRole) ? '/astrologer' : '/consumer';
      router.replace(dest);
    } catch (e) {
      setSigningIn(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <Image source={require('@/assets/images/background.webp')} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Ionicons name="planet" size={44} color="#ffffff" />
            </View>
            <ThemedText style={styles.appName}>Koshmira</ThemedText>
            <ThemedText style={styles.tagline}>
              {t('login.tagline')}
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>{t('login.welcome')}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              {t('login.subtitle')}
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
                    {t('login.google')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => router.push('/onboarding')}
              disabled={signingIn || loading}>
              <ThemedText style={styles.guestBtnText}>
                {t('login.guest')}
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.privacy}>
              {t('login.privacy')}
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
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: ACCENT,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
  },
  guestBtnText: { color: ACCENT, fontSize: 16, fontWeight: '700' },
  privacy: {
    fontSize: 12,
    color: '#7E7E78',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 17,
  },
});