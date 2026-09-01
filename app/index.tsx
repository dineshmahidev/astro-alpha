import { Redirect } from 'expo-router';
import { useAuth, isAstrologer } from '@/contexts/auth-context';

export default function Index() {
  const { role, loading, resolving } = useAuth();
  if (loading || resolving) return null;
  return <Redirect href={isAstrologer(role) ? '/astrologer' : '/consumer'} />;
}
