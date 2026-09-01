import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { appConfig } from '@/constants/app-config';
import type { AppLanguage } from '@/constants/i18n';
import { supabase } from '@/lib/supabase';

export type BirthDetails = {
  name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  dobDate: Date;
  tob: string;
  tobDate: Date;
  tobKnown: boolean;
  place: string;
  rashi?: string;
  nakshatra?: string;
  gothram?: string;
};

export type UserRole = 'user' | 'astrologer' | 'admin';

export type AuthState = {
  user: GoogleUser['user'] | null;
  role: UserRole;
  credits: number;
  birthDetails: BirthDetails | null;
  language: AppLanguage;
  loading: boolean;
  /** True while the initial birth-details restore (backend fetch) is in flight. */
  resolving: boolean;
  signIn: () => Promise<{ hasBirth: boolean; role: UserRole }>;
  signOut: () => Promise<void>;
  saveBirthDetails: (details: BirthDetails) => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
};

const STORAGE_KEYS = {
  user: 'auth:user',
  birthDetails: 'auth:birth-details',
  language: 'auth:language',
  role: 'auth:role',
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser['user'] | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [credits, setCredits] = useState(0);
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    console.log('[Auth] GoogleSignin.configure with webClientId:', appConfig.googleSignIn.webClientId);
    try {
      GoogleSignin.configure({ webClientId: appConfig.googleSignIn.webClientId });
      console.log('[Auth] GoogleSignin.configure OK');
    } catch (e) {
      console.error('[Auth] GoogleSignin.configure FAILED', e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setResolving(true);
    (async () => {
      console.log('[Auth] Loading persisted auth state...');
      try {
        const [savedUser, savedDetails, savedLanguage, savedRole] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.birthDetails),
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.role),
        ]);
        if (!active) return;
        console.log('[Auth] persisted user:', savedUser ? 'found' : 'none');
        console.log('[Auth] persisted birthDetails:', savedDetails ? 'found' : 'none');
        console.log('[Auth] persisted language:', savedLanguage ?? 'en');
        // Apply cached birth details IMMEDIATELY so a returning user never sees
        // the onboarding form popup while the backend refresh is in flight.
        if (savedDetails) {
          const d = JSON.parse(savedDetails);
          d.dobDate = new Date(d.dobDate);
          d.tobDate = new Date(d.tobDate);
          if (!active) return;
          setBirthDetails(d);
        }
        if (savedRole) {
          setRole(savedRole as UserRole);
          console.log('[Auth] restored persisted role:', savedRole);
        }
        if (savedUser) {
          const u = JSON.parse(savedUser) as GoogleUser['user'];
          setUser(u);
          await restoreBirthDetails(
            u.email ?? '',
            u.name ?? '',
            (savedRole as UserRole) ?? 'user',
          );
        }
        if (savedLanguage) setLanguageState(savedLanguage as AppLanguage);
      } catch (e) {
        console.error('[Auth] failed to load persisted state', e);
      } finally {
        if (active) {
          setLoading(false);
          setResolving(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const syncUserToBackend = async (u: GoogleUser['user']) => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', u.email)
        .maybeSingle();

      // Detect role from astrologers table
      let detectedRole: UserRole = 'user';
      const { data: astroRow } = await supabase
        .from('astrologers')
        .select('id')
        .ilike('email', u.email?.trim() ?? '')
        .maybeSingle();
      if (astroRow) {
        detectedRole = 'astrologer';
        console.log('[Auth] syncUserToBackend: matched astrologer', u.email);
      }

      // Also check existing role column (preserve admin)
      if (existing?.role === 'admin') detectedRole = 'admin';

      const payload = {
        id: existing?.id ?? u.id,
        email: u.email,
        name: u.name,
        plan: existing?.plan ?? 'free',
        credits: existing?.credits ?? 100,
        total_requests: existing?.total_requests ?? 0,
        role: detectedRole,
      };
      const { error } = await supabase.from('users').upsert(payload as never);
      if (error) console.error('[Auth] sync user to backend failed', error.message);
      else console.log('[Auth] user synced to backend:', u.email, 'role:', detectedRole);
    } catch (e) {
      console.warn('[Auth] backend sync error (ignoring)', e);
    }
  };

  const restoreBirthDetails = async (
    email: string,
    name: string,
    fallbackRole: UserRole = 'user',
  ): Promise<{ hasBirth: boolean; role: UserRole }> => {
    let resolvedRole: UserRole = fallbackRole;
    try {
      const { data } = await supabase
        .from('users')
        .select('dob, tob, tob_known, place, rashi, nakshatra, credits')
        .eq('email', email)
        .maybeSingle();
      setCredits(data?.credits ?? 0);

      // Check users.role column first
      try {
        const { data: roleData, error: roleErr } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .maybeSingle();
        console.log('[Auth] users.role query:', roleData, roleErr?.message);
        if (roleData?.role === 'astrologer' || roleData?.role === 'admin') {
          resolvedRole = roleData.role as UserRole;
          console.log('[Auth] role from users table:', resolvedRole);
        } else {
          // Fallback: check astrologers table
          console.log('[Auth] checking astrologers table for email:', email);
          const { data: astroRow, error: astroErr } = await supabase
            .from('astrologers')
            .select('id, email, name')
            .ilike('email', email.trim())
            .maybeSingle();
          console.log('[Auth] astrologers query result:', astroRow, astroErr?.message);
          if (astroRow) {
            resolvedRole = 'astrologer';
            console.log('[Auth] matched astrologer:', astroRow.name, astroRow.email);
          } else {
            resolvedRole = 'user';
            console.log('[Auth] no astrologer match, role=user');
          }
        }
      } catch (e) {
        console.warn('[Auth] role column check failed:', e);
        const { data: astroRow } = await supabase
          .from('astrologers')
          .select('id, email, name')
          .ilike('email', email.trim())
          .maybeSingle();
        console.log('[Auth] fallback astrologers query:', astroRow);
        if (astroRow) resolvedRole = 'astrologer';
        else resolvedRole = 'user';
      }
      console.log('[Auth] final resolved role:', resolvedRole, 'for email:', email);
      setRole(resolvedRole);
      await AsyncStorage.setItem(STORAGE_KEYS.role, resolvedRole);
      if (!data?.dob) {
        console.log('[Auth] no birth details on backend for', email);
        return { hasBirth: false, role: resolvedRole };
      }
      const [d, m, y] = data.dob.split('/').map(Number);
      const dobDate = new Date(y, m - 1, d);
      let tobDate = dobDate;
      if (data.tob_known && data.tob) {
        const [hh, mm] = data.tob.split(':').map(Number);
        tobDate = new Date(y, m - 1, d, hh, mm);
      }
      const details: BirthDetails = {
        name: name || '',
        gender: 'male',
        dob: data.dob,
        dobDate,
        tob: data.tob ?? '',
        tobDate,
        tobKnown: !!data.tob_known,
        place: data.place ?? '',
        rashi: data.tob_known ? undefined : (data.rashi ?? undefined),
        nakshatra: data.tob_known ? undefined : (data.nakshatra ?? undefined),
      };
      setBirthDetails(details);
      await AsyncStorage.setItem(STORAGE_KEYS.birthDetails, JSON.stringify(details));
      console.log('[Auth] restored birth details from backend:', email);
      return { hasBirth: true, role: resolvedRole };
    } catch (e) {
      console.warn('[Auth] restore birth details error (ignoring)', e);
      return { hasBirth: false, role: resolvedRole };
    }
  };

  const signIn = async (): Promise<{ hasBirth: boolean; role: UserRole }> => {
    console.log('[Auth] signIn started');
    try {
      console.log('[Auth] checking Play Services...');
      const has = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('[Auth] hasPlayServices:', has);
      console.log('[Auth] opening Google sign-in UI...');
      const gUser = await GoogleSignin.signIn();
      console.log('[Auth] signIn resolved user:', JSON.stringify(gUser.user, null, 2));
      const u = gUser.user;
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
      await syncUserToBackend(u);
      const result = await restoreBirthDetails(u.email ?? '', u.name ?? '');
      await AsyncStorage.setItem(STORAGE_KEYS.role, result.role);
      console.log('[Auth] user persisted, signIn done. hasBirth:', result.hasBirth, 'role:', result.role);
      return result;
    } catch (e: any) {
      console.error('[Auth] signIn error:', JSON.stringify(e, null, 2));
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[Auth] sign-in cancelled by user');
        return { hasBirth: false, role: 'user' };
      }
      throw e;
    }
  };

  const signOut = async () => {
    console.log('[Auth] signOut started');
    try {
      await GoogleSignin.signOut();
      console.log('[Auth] GoogleSignin.signOut OK');
    } catch (e) {
      console.warn('[Auth] GoogleSignin.signOut failed (ignoring)', e);
    }
    setUser(null);
    setRole('user');
    setCredits(0);
    setBirthDetails(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.user, STORAGE_KEYS.birthDetails, STORAGE_KEYS.role]);
    console.log('[Auth] local state cleared, signOut done');
  };

  const saveBirthDetails = async (details: BirthDetails) => {
    setBirthDetails(details);
    await AsyncStorage.setItem(STORAGE_KEYS.birthDetails, JSON.stringify(details));
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        const { error } = await supabase.from('users').upsert({
          id: existing?.id ?? user.id,
          email: user.email,
          name: user.name,
          plan: existing?.plan ?? 'free',
          credits: existing?.credits ?? 100,
          total_requests: existing?.total_requests ?? 0,
          dob: details.dob,
          tob: details.tobKnown ? details.tob : null,
          tob_known: details.tobKnown,
          place: details.place.trim(),
          rashi: details.tobKnown ? null : details.rashi ?? null,
          nakshatra: details.tobKnown ? null : details.nakshatra ?? null,
        } as never);
        if (error) console.error('[Auth] sync birth details to backend failed', error.message);
        else console.log('[Auth] birth details synced to backend:', user.email);
      } catch (e) {
        console.warn('[Auth] birth-details backend sync error (ignoring)', e);
      }
    }
  };

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, credits, birthDetails, language, loading, resolving, signIn, signOut, saveBirthDetails, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function isAstrologer(role: UserRole): boolean {
  return role === 'astrologer' || role === 'admin';
}