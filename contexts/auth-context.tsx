import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { appConfig } from '@/constants/app-config';

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
};

export type AuthState = {
  user: GoogleUser['user'] | null;
  birthDetails: BirthDetails | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveBirthDetails: (details: BirthDetails) => Promise<void>;
};

const STORAGE_KEYS = {
  user: 'auth:user',
  birthDetails: 'auth:birth-details',
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser['user'] | null>(null);
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: appConfig.googleSignIn.webClientId });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedUser, savedDetails] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.birthDetails),
        ]);
        if (!active) return;
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedDetails) {
          const d = JSON.parse(savedDetails);
          d.dobDate = new Date(d.dobDate);
          d.tobDate = new Date(d.tobDate);
          setBirthDetails(d);
        }
      } catch {
        // ignore corrupt storage
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const gUser = await GoogleSignin.signIn();
      const u = gUser.user;
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore — still clear local state
    }
    setUser(null);
    setBirthDetails(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.user, STORAGE_KEYS.birthDetails]);
  };

  const saveBirthDetails = async (details: BirthDetails) => {
    setBirthDetails(details);
    await AsyncStorage.setItem(STORAGE_KEYS.birthDetails, JSON.stringify(details));
  };

  return (
    <AuthContext.Provider
      value={{ user, birthDetails, loading, signIn, signOut, saveBirthDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}