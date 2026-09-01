import { supabase } from './supabase';

export type Chat = {
  id: string;
  user_email: string;
  astrologer_id: string;
  status: 'active' | 'closed';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
};

export type Message = {
  id: string;
  chat_id: string;
  sender: 'user' | 'astrologer';
  text: string;
  created_at: string;
};

export type Payment = {
  id: string;
  user_email: string;
  astrologer_id: string;
  chat_id: string | null;
  amount: number;
  status: 'paid' | 'refunded';
  created_at: string;
};

export async function findOrCreateChat(userEmail: string, astrologerId: string): Promise<Chat | null> {
  try {
    const { data: existing } = await supabase
      .from('chats')
      .select('*')
      .eq('user_email', userEmail)
      .eq('astrologer_id', astrologerId)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) return existing as Chat;
    const { data, error } = await supabase
      .from('chats')
      .insert({ user_email: userEmail, astrologer_id: astrologerId, status: 'active', started_at: new Date().toISOString() })
      .select()
      .single();
    if (error) {
      console.warn('[Chat] findOrCreateChat insert failed', error.message);
      return null;
    }
    return data as Chat;
  } catch (e) {
    console.warn('[Chat] findOrCreateChat error', e);
    return null;
  }
}

export async function recordPayment(p: {
  user_email: string;
  astrologer_id: string;
  chat_id: string | null;
  amount: number;
}): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({ ...p, status: 'paid' })
      .select()
      .single();
    if (error) {
      console.warn('[Chat] recordPayment failed', error.message);
      return null;
    }
    return data as Payment;
  } catch (e) {
    console.warn('[Chat] recordPayment error', e);
    return null;
  }
}

export async function listMessages(chatId: string): Promise<Message[]> {
  try {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    return (data ?? []) as Message[];
  } catch (e) {
    console.warn('[Chat] listMessages error', e);
    return [];
  }
}

export async function sendMessage(
  chatId: string,
  sender: 'user' | 'astrologer',
  text: string,
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender, text })
      .select()
      .single();
    if (error) {
      console.warn('[Chat] sendMessage failed', error.message);
      return null;
    }
    return data as Message;
  } catch (e) {
    console.warn('[Chat] sendMessage error', e);
    return null;
  }
}

export function subscribeChat(
  chatId: string,
  onMessage: (m: Message) => void,
) {
  return supabase
    .channel(`chat-${chatId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();
}

export async function listAstrologerChats(astrologerId: string): Promise<Chat[]> {
  try {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('astrologer_id', astrologerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    return (data ?? []) as Chat[];
  } catch (e) {
    console.warn('[Chat] listAstrologerChats error', e);
    return [];
  }
}

export async function listAstrologerPayments(astrologerId: string): Promise<Payment[]> {
  try {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('astrologer_id', astrologerId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });
    return (data ?? []) as Payment[];
  } catch (e) {
    console.warn('[Chat] listAstrologerPayments error', e);
    return [];
  }
}

export async function getUserByEmail(email: string) {
  try {
    const { data } = await supabase
      .from('users')
      .select('name, dob, tob, tob_known, place, rashi, nakshatra')
      .eq('email', email)
      .maybeSingle();
    return data;
  } catch (e) {
    console.warn('[Chat] getUserByEmail error', e);
    return null;
  }
}

export async function startSession(chatId: string): Promise<void> {
  try {
    await supabase
      .from('chats')
      .update({ started_at: new Date().toISOString() })
      .eq('id', chatId);
  } catch (e) {
    console.warn('[Chat] startSession error', e);
  }
}

export async function closeSession(chatId: string): Promise<void> {
  try {
    await supabase
      .from('chats')
      .update({
        status: 'closed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', chatId);
  } catch (e) {
    console.warn('[Chat] closeSession error', e);
  }
}

export type DailyStats = {
  sessionsToday: number;
  revenueToday: number;
  minutesToday: number;
};

export async function getTodayStats(astrologerId: string): Promise<DailyStats> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { data: chats } = await supabase
      .from('chats')
      .select('id, started_at, ended_at, created_at')
      .eq('astrologer_id', astrologerId)
      .gte('created_at', todayIso);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('astrologer_id', astrologerId)
      .eq('status', 'paid')
      .gte('created_at', todayIso);

    const sessionsToday = chats?.length ?? 0;
    const revenueToday = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ?? 0;

    let minutesToday = 0;
    for (const c of chats ?? []) {
      const start = c.started_at ? new Date(c.started_at) : null;
      const end = c.ended_at ? new Date(c.ended_at) : new Date();
      if (start) {
        minutesToday += Math.round((end.getTime() - start.getTime()) / 60000);
      }
    }

    return { sessionsToday, revenueToday, minutesToday };
  } catch (e) {
    console.warn('[Chat] getTodayStats error', e);
    return { sessionsToday: 0, revenueToday: 0, minutesToday: 0 };
  }
}