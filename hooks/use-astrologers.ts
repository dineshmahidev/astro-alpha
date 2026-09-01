import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Astrologer } from '@/constants/astrologers';

type DBAstrologer = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  mobile: string | null;
  rating: number | null;
  specialty: string | null;
  location: string | null;
  experience: string | null;
  bio: string | null;
};

function mapDBToAstrologer(row: DBAstrologer): Astrologer {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar || '',
    avatarColor: '#6C5CE7',
    mobile: row.mobile || '',
    lastMsg: '',
    time: '',
    rating: row.rating != null ? String(row.rating) : '0',
    specialty: row.specialty || '',
    location: row.location || '',
    experience: row.experience || '',
    bio: row.bio || '',
  };
}

export function useAstrologers() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchAstrologers() {
      const { data, error } = await supabase
        .from('astrologers')
        .select('*')
        .order('name');

      if (!active) return;

      if (error) {
        console.warn('[useAstrologers] Supabase error:', error.message);
        setAstrologers([]);
      } else {
        setAstrologers((data || []).map(mapDBToAstrologer));
      }
      setLoading(false);
    }

    fetchAstrologers();
    return () => { active = false; };
  }, []);

  return { astrologers, loading };
}
