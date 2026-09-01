import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';
const GREEN = '#7BD88F';

const TAROT_DECK = [
  { name: 'The Fool', meaning: 'New beginnings, innocence, leap of faith.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_Fool_tarot_card_artwork_202608162246.jpeg') },
  { name: 'The Magician', meaning: 'Manifestation, power, willpower.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Magician_tarot_card_with_altar_202608162246.jpeg') },
  { name: 'The Empress', meaning: 'Abundance, nurturing, beauty.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_Empress_tarot_card_202608162246.jpeg') },
  { name: 'The Hermit', meaning: 'Introspection, soul-searching, guidance.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_Hermit_tarot_card_art_202608162246.jpeg') },
  { name: 'The Tower', meaning: 'Sudden change, upheaval, revelation.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_Tower_tarot_card_struck_202608162246.jpeg') },
  { name: 'The Hanged Man', meaning: 'Pause, surrender, new perspective.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_Hanged_Man_tarot_card_202608162246.jpeg') },
  { name: 'Temperance', meaning: 'Balance, moderation, patience.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Temperance_tarot_card_design_202608162246.jpeg') },
  { name: 'The World', meaning: 'Completion, accomplishment, wholeness.', position: 'past' as const, img: require('@/assets/images/tarot-cards/The_World_tarot_card_202608162246.jpeg') },
  { name: 'Judgement', meaning: 'Rebirth, calling, reflection.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Gothic_tarot_card_Judgement_202608162246.jpeg') },
  { name: 'Knight of Cups', meaning: 'Romance, charm, imagination.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Knight_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Queen of Cups', meaning: 'Compassion, calm, intuition.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Queen_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'King of Cups', meaning: 'Emotional balance, generosity.', position: 'past' as const, img: require('@/assets/images/tarot-cards/King_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Two of Wands', meaning: 'Planning, decisions, discovery.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Two_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Ace of Wands', meaning: 'Inspiration, new energy, potential.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Ace_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Four of Swords', meaning: 'Rest, relaxation, recovery.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Four_of_Swords_tarot_card_202608162246.jpeg') },
  { name: 'Six of Pentacles', meaning: 'Generosity, sharing, charity.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Six_of_Pentacles_tarot_card_202608162246.jpeg') },
  { name: 'Seven of Swords', meaning: 'Strategy, planning, resourcefulness.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Seven_of_Swords_tarot_card_202608162246.jpeg') },
  { name: 'Eight of Wands', meaning: 'Speed, movement, swift change.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Eight_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Ten of Cups', meaning: 'Happiness, alignment, harmony.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Ten_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Page of Wands', meaning: 'Enthusiasm, exploration, discovery.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Page_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'King of Wands', meaning: 'Natural-born leader, boldness.', position: 'past' as const, img: require('@/assets/images/tarot-cards/King_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Queen of Pentacles', meaning: 'Nurturing, practical, abundance.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Queen_of_Pentacles_tarot_card_202608162246.jpeg') },
  { name: 'Gargoyle', meaning: 'Protection, hidden fears, strength.', position: 'past' as const, img: require('@/assets/images/tarot-cards/Gargoyle_tarot_card_design_202608162246.jpeg') },
];

type SpreadCard = { name: string; meaning: string; position: string; img: any };
type ChatMsg = { id: string; role: 'user' | 'ai'; text: string };

const CATEGORIES_EN = [
  { id: 'love', label: 'Love', icon: 'heart' as const, color: '#E57373' },
  { id: 'career', label: 'Career', icon: 'briefcase' as const, color: '#4FC3F7' },
  { id: 'marriage', label: 'Marriage', icon: 'people' as const, color: '#BA68C8' },
  { id: 'finance', label: 'Finance', icon: 'cash' as const, color: GREEN },
  { id: 'health', label: 'Health', icon: 'medical' as const, color: '#FFB74D' },
  { id: 'education', label: 'Education', icon: 'school' as const, color: '#81C784' },
  { id: 'family', label: 'Family', icon: 'home' as const, color: '#CE93D8' },
  { id: 'custom', label: 'Ask Question', icon: 'chatbubble' as const, color: ACCENT },
];

const CATEGORIES_TA = [
  { id: 'love', label: 'காதல்', icon: 'heart' as const, color: '#E57373' },
  { id: 'career', label: 'தொழில்', icon: 'briefcase' as const, color: '#4FC3F7' },
  { id: 'marriage', label: 'திருமணம்', icon: 'people' as const, color: '#BA68C8' },
  { id: 'finance', label: 'நிதி', icon: 'cash' as const, color: GREEN },
  { id: 'health', label: 'ஆரோக்கியம்', icon: 'medical' as const, color: '#FFB74D' },
  { id: 'education', label: 'கல்வி', icon: 'school' as const, color: '#81C784' },
  { id: 'family', label: 'குடும்பம்', icon: 'home' as const, color: '#CE93D8' },
  { id: 'custom', label: 'கேள்வி கேளுங்கள்', icon: 'chatbubble' as const, color: ACCENT },
];

const CATEGORIES_HI = [
  { id: 'love', label: 'प्रेम', icon: 'heart' as const, color: '#E57373' },
  { id: 'career', label: 'करियर', icon: 'briefcase' as const, color: '#4FC3F7' },
  { id: 'marriage', label: 'विवाह', icon: 'people' as const, color: '#BA68C8' },
  { id: 'finance', label: 'वित्त', icon: 'cash' as const, color: GREEN },
  { id: 'health', label: 'स्वास्थ्य', icon: 'medical' as const, color: '#FFB74D' },
  { id: 'education', label: 'शिक्षा', icon: 'school' as const, color: '#81C784' },
  { id: 'family', label: 'परिवार', icon: 'home' as const, color: '#CE93D8' },
  { id: 'custom', label: 'प्रश्न पूछें', icon: 'chatbubble' as const, color: ACCENT },
];

const CATEGORY_QUESTIONS: Record<string, Record<string, string>> = {
  love: { en: 'How is my love life looking?', ta: 'என் காதல் வாழ்க்கை எப்படி இருக்கிறது?', hi: 'मेरी प्रेम जीवन कैसा दिख रहा है?' },
  career: { en: 'How will my career progress?', ta: 'என் தொழில் எப்படி வளரும்?', hi: 'मेरा करियर कैसे आगे बढ़ेगा?' },
  marriage: { en: 'When will I get married?', ta: 'நான் எப்போது திருமணம் செய்வேன்?', hi: 'मेरी शादी कब होगी?' },
  finance: { en: 'How will my finances be?', ta: 'என் நிதி நிலை எப்படி இருக்கும்?', hi: 'मेरी आर्थिक स्थिति कैसी रहेगी?' },
  health: { en: 'How is my health outlook?', ta: 'என் ஆரோக்கியம் எப்படி இருக்கும்?', hi: 'मेरे स्वास्थ्य का क्या हाल है?' },
  education: { en: 'How will my studies go?', ta: 'என் படிப்பு எப்படி இருக்கும்?', hi: 'मेरी पढ़ाई कैसी रहेगी?' },
  family: { en: 'How is my family life?', ta: 'என் குடும்ப வாழ்க்கை எப்படி இருக்கும்?', hi: 'मेरा पारिवारिक जीवन कैसा रहेगा?' },
};

function detectLanguage(appLang: string): 'ta' | 'hi' | 'en' {
  if (appLang === 'ta') return 'ta';
  if (appLang === 'hi') return 'hi';
  return 'en';
}

function getWelcomeText(lang: string): string {
  if (lang === 'ta') return 'உங்கள் கேள்வியைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் சொந்த கேள்வியை உள்ளிடவும்';
  if (lang === 'hi') return 'अपना प्रश्न चुनें या अपना प्रश्न लिखें';
  return 'Select your question or type your own';
}

function getCardPosLabel(pos: string, lang: string): string {
  if (lang === 'ta') return pos === 'Past' ? 'கடந்த காலம்' : pos === 'Present' ? 'நிகழ்காலம்' : 'எதிர்காலம்';
  if (lang === 'hi') return pos === 'Past' ? 'अतीत' : pos === 'Present' ? 'वर्तमान' : 'भविष्य';
  return pos;
}

function generateTarotReading(cards: SpreadCard[], userMsg: string, lang: string): string {
  const card1 = cards[0];
  const card2 = cards[1];
  const card3 = cards[2];
  const pos1 = getCardPosLabel('Past', lang);
  const pos2 = getCardPosLabel('Present', lang);
  const pos3 = getCardPosLabel('Future', lang);

  if (lang === 'ta') {
    return `🔮 உங்கள் தரோட் ரீடிஂ

கேள்வி: ${userMsg}

🃏 ${pos1} — ${card1.name}
${card1.meaning} — இந்த card உங்கள் கடந்த கால அனுபவத்தையும், இந்த சூழ்நிலைக்கு வழிவகுத்த காரணிகளையும் காட்டுகிறது. இது உங்கள் தற்போதைய நிலைக்கான அடிப்படையை அமைத்தது.

🃏 ${pos2} — ${card2.name}
${card2.meaning} — இப்போது நீங்கள் இருக்கும் இடத்தையும், தற்போதைய சூழ்நிலையையும் இந்த card பிரதிபலிக்கிறது. இது உங்கள் கேள்வியின் மையப் புள்ளி.

🃏 ${pos3} — ${card3.name}
${card3.meaning} — இந்த card விஷயங்கள் எந்த திசையில் செல்கின்றன என்பதைக் குறிக்கிறது. இது சாத்தியமான வளர்ச்சியையும், நீங்கள் கருத்தில் கொள்ள வேண்டிய பாதையையும் காட்டுகிறது.

✨ ஒட்டுமொத்த ரீடிங்
இந்த மூன்று card-களையும் ஒன்றாகப் பார்க்கும்போது, உங்கள் கடந்த கால அனுபவம் ${card2.name} மூலம் தற்போதைய நிலைக்கு வழிவகுத்தது, மேலும் ${card3.name} எதிர்காலத்தில் ஒரு தெளிவான பாதையைக் காட்டுகிறது.

💫 வழிகாட்டுதல்
இந்த ரீடிங் உங்கள் கேள்விக்கு ஒரு நிலையான பார்வையை வழங்குகிறது. இந்த cards-ஐ சிந்தனைக்கு ஒரு கருவியாகப் பயன்படுத்துங்கள், ஆனால் உங்கள் சொந்த நுண்ணறிவு மற்றும் நடைமுறை முடிவுகளை நம்புங்கள்.`;
  }

  if (lang === 'hi') {
    return `🔮 आपका टैरो रीडिंग

प्रश्न: ${userMsg}

🃏 ${pos1} — ${card1.name}
${card1.meaning} — यह कार्ड आपके अतीत के अनुभव और इस स्थिति के पृष्ठभूमि को दर्शाता है। इसने आपकी वर्तमान स्थिति की नींव रखी है।

🃏 ${pos2} — ${card2.name}
${card2.meaning} — यह कार्ड आपकी वर्तमान स्थिति को दर्शाता है। यह आपके प्रश्न का मूल बिंदु है।

🃏 ${pos3} — ${card3.name}
${card3.meaning} — यह कार्ड इस बात का संकेत देता है कि चीजें किस दिशा में जा रही हैं।

✨ समग्र रीडिंग
इन तीन कार्डों को एक साथ देखने पर, आपका अतीत ${card2.name} के माध्यम से वर्तमान स्थिति तक पहुँचा, और ${card3.name} भविष्य में एक स्पष्ट मार्ग दिखाता है।

💫 मार्गदर्शन
यह रीडिंग आपके प्रश्न के लिए एक स्थिर दृष्टिकोण प्रदान करती है। इन कार्डों को चिंतन के एक उपकरण के रूप में उपयोग करें, लेकिन अपनी अंतर्ज्ञान और व्यावहारिक निर्णयों पर भरोसा करें।`;
  }

  return `🔮 Your Tarot Reading

Question: ${userMsg}

🃏 ${pos1} — ${card1.name}
${card1.meaning} — This card reveals the background of your situation and the experiences that have led you to this point. It establishes the foundation upon which your current circumstances rest.

🃏 ${pos2} — ${card2.name}
${card2.meaning} — This card reflects where you stand right now. It captures the essence of your current situation and speaks directly to the heart of your question.

🃏 ${pos3} — ${card3.name}
${card3.meaning} — This card points toward where things are heading. It suggests the direction of possible development and highlights what you should keep in mind.

✨ Overall Reading
Looking at all three cards together, your past energy of ${card1.name} has shaped the present situation of ${card2.name}, and the cards point toward ${card3.name} in the future. Together they tell a connected story of transformation and growth.

💫 Guidance
This reading offers a thoughtful perspective on your question. Use these cards as a tool for reflection, but trust your own intuition and practical judgment as you navigate what lies ahead.`;
}

export default function TarotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useAuth();
  const lang = detectLanguage(language);
  const [phase, setPhase] = useState<'intro' | 'category' | 'reveal' | 'chat'>('intro');
  const [cards, setCards] = useState<SpreadCard[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SpreadCard | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const flipAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const chatRef = useRef<FlatList>(null);

  const categories = lang === 'ta' ? CATEGORIES_TA : lang === 'hi' ? CATEGORIES_HI : CATEGORIES_EN;

  const drawCards = (question: string) => {
    setUserQuestion(question);
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3).map((c, i) => ({
      ...c,
      position: ['Past', 'Present', 'Future'][i],
    }));
    setCards(picked);
    setRevealed([false, false, false]);
    setPhase('reveal');
    flipAnims.forEach((a) => a.setValue(0));
  };

  const selectCategory = (catId: string) => {
    if (catId === 'custom') {
      setPhase('chat');
      setChatMsgs([{
        id: '0',
        role: 'ai',
        text: lang === 'ta' ? 'உங்கள் கேள்வியை உள்ளிடவும்' : lang === 'hi' ? 'अपना प्रश्न लिखें' : 'Type your question below',
      }]);
      return;
    }
    const question = CATEGORY_QUESTIONS[catId]?.[lang] ?? CATEGORY_QUESTIONS[catId]?.en ?? '';
    drawCards(question);
  };

  const revealCard = (index: number) => {
    if (revealed[index]) {
      setSelectedCard(cards[index]);
      return;
    }
    Animated.spring(flipAnims[index], { toValue: 1, friction: 8, tension: 10, useNativeDriver: true }).start();
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
  };

  const allRevealed = revealed.every(Boolean);

  const startChat = () => {
    const welcome = lang === 'ta'
      ? `கோஷ்மிரா தரோட் ரீடிஂக்கு வரவேற்கிறோம்! 🌟\n\nஉங்கள் 3-கார்ட் ஸ்ப்ரெட்:\n\n🔮 கடந்த காலம்: ${cards[0].name}\n🔮 நிகழ்காலம்: ${cards[1].name}\n🔮 எதிர்காலம்: ${cards[2].name}\n\nஉங்கள் கேள்வியை உள்ளிடவும்`
      : lang === 'hi'
      ? `कोश्मिरा टैरो रीडिंग में आपका स्वागत है! 🌟\n\nआपका 3-कार्ड स्प्रेड:\n\n🔮 अतीत: ${cards[0].name}\n🔮 वर्तमान: ${cards[1].name}\n🔮 भविष्य: ${cards[2].name}\n\nअपना प्रश्न लिखें`
      : `Welcome to Koshmira Tarot Reading! 🌟\n\nYour 3-card spread:\n\n🔮 Past: ${cards[0].name}\n🔮 Present: ${cards[1].name}\n🔮 Future: ${cards[2].name}\n\nType your question below`;
    setChatMsgs([{ id: '0', role: 'ai', text: welcome }]);
    setPhase('chat');
  };

  const sendMessage = () => {
    const txt = input.trim();
    if (!txt) return;
    setInput('');

    if (cards.length === 0) {
      drawCards(txt);
      return;
    }

    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', text: txt };
    setChatMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const aiText = generateTarotReading(cards, txt, lang);
      setChatMsgs((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: aiText }]);
      setTyping(false);
    }, 1500);
  };

  const reset = () => {
    setPhase('intro');
    setCards([]);
    setRevealed([false, false, false]);
    setChatMsgs([]);
    setUserQuestion('');
    flipAnims.forEach((a) => a.setValue(0));
  };

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{lang === 'ta' ? 'தரோட் ரீடிங்' : lang === 'hi' ? 'टैरो रीडिंग' : 'Tarot Reading'}</Text>
          <TouchableOpacity style={s.headerRight}>
            <Image source={require('../assets/images/quick-action/tarot.png')} style={s.headerIcon} contentFit="cover" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {phase === 'chat' ? (
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            ref={chatRef}
            data={chatMsgs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[s.chatRow, item.role === 'user' && s.chatRowRight]}>
                {item.role === 'ai' && <View style={s.chatAvatar}><Ionicons name="star" size={14} color={ACCENT} /></View>}
                <View style={[s.chatBubble, item.role === 'user' ? s.chatBubbleUser : s.chatBubbleAI]}>
                  <Text style={[s.chatText, item.role === 'user' && s.chatTextUser]}>{item.text}</Text>
                </View>
              </View>
            )}
          />
          <View style={[s.chatInputBar, { paddingBottom: insets.bottom + 6 }]}>
            <View style={s.chatInputWrap}>
              <TextInput
                style={s.chatInput}
                value={input}
                onChangeText={setInput}
                placeholder={lang === 'ta' ? 'ரீடிங் பற்றி கேளுங்கள்...' : lang === 'hi' ? 'रीडिंग के बारे में पूछें...' : 'Ask about your reading...'}
                placeholderTextColor={TEXT_DIM}
                multiline
              />
            </View>
            <TouchableOpacity style={[s.chatSendBtn, !input.trim() && { opacity: 0.4 }]} onPress={sendMessage} disabled={!input.trim()}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Banner */}
              <View style={s.bannerWrap}>
                <ImageBackground
                  source={require('../assets/tarot-banner.png')}
                  style={s.banner}
                  imageStyle={s.bannerImage}
                  resizeMode="cover"
                >
                <View style={s.bannerOverlay}>
                  <Image source={require('../assets/Koshmira_text.png')} style={s.bannerLogo} contentFit="contain" />
                  <Text style={s.bannerTitle}>{lang === 'ta' ? 'தரோட் ரீடிங்' : lang === 'hi' ? 'टैरो रीडिंग' : 'Tarot Reading'}</Text>
                  <Text style={s.bannerSub}>{lang === 'ta' ? 'கார்டுகள் உங்களுக்காக என்ன வைத்திருக்கின்றன என்பதை வெளிப்படுத்துங்கள்' : lang === 'hi' ? 'कार्ड आपके लिए क्या छुपा रहे हैं, जानें' : 'Reveal what the cards hold for you'}</Text>
                </View>
                </ImageBackground>
              </View>

              {phase === 'intro' ? (
                <>
                  <Text style={s.sectionTitle}>{lang === 'ta' ? 'தலைப்பைத் தேர்ந்தெடுக்கவும்' : lang === 'hi' ? 'विषय चुनें' : 'Choose a Category'}</Text>
                  <Text style={s.descSub}>{getWelcomeText(lang)}</Text>

                  <View style={s.catGrid}>
                    {categories.map((cat) => (
                      <TouchableOpacity key={cat.id} style={s.catCard} onPress={() => selectCategory(cat.id)}>
                        <View style={[s.catIcon, { backgroundColor: cat.color + '15' }]}>
                          <Ionicons name={cat.icon} size={22} color={cat.color} />
                        </View>
                        <Text style={s.catLabel}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={s.sectionTitle}>Your Spread</Text>

                  {/* 3 Cards */}
                  <View style={s.spreadRow}>
                    {cards.map((card, i) => {
                      const rotateY = flipAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
                      const frontOp = flipAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
                      const backOp = flipAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

                      return (
                        <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => revealCard(i)} style={s.spreadCardWrap}>
                          <Text style={s.spreadPosition}>{getCardPosLabel(card.position, lang)}</Text>
                          <Animated.View style={[s.spreadCard, { transform: [{ rotateY }] }]}>
                            <Animated.View style={[s.spreadFace, s.spreadFront, { opacity: frontOp }]}>
                              <Ionicons name="star" size={28} color={ACCENT} />
                              <Text style={s.frontLabel}>?</Text>
                            </Animated.View>
                            <Animated.View style={[s.spreadFace, s.spreadBack, { opacity: backOp }]}>
                              <Image source={card.img} style={s.spreadThumbFull} contentFit="cover" />
                            </Animated.View>
                          </Animated.View>
                          {revealed[i] && <Text style={s.spreadName}>{card.name}</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {allRevealed && (
                    <>
                      {/* Reading Summary */}
                      <View style={s.summaryCard}>
                        {cards.map((card, i) => (
                          <View key={i} style={s.summaryItem}>
                            <View style={s.summaryHeader}>
                              <Ionicons name="star" size={14} color={ACCENT} />
                              <Text style={s.summaryTitle}>{getCardPosLabel(card.position, lang)}: {card.name}</Text>
                            </View>
                            <Text style={s.summaryDesc}>{card.meaning}</Text>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity style={s.drawBtn} onPress={startChat}>
                        <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                        <Text style={s.drawBtnText}>{lang === 'ta' ? 'ரீடிங் பற்றி பேசுங்கள்' : lang === 'hi' ? 'रीडिंग के बारे में बात करें' : 'Chat About Your Reading'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={s.resetBtn} onPress={reset}>
                        <Text style={s.resetTxt}>{lang === 'ta' ? 'மீண்டும் இழுக்கவும்' : lang === 'hi' ? 'फिर से खींचें' : 'Draw Again'}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              <View style={{ height: 40 }} />
            </>
          )}
        />
      )}

      {/* Card Detail Modal */}
      <Modal visible={!!selectedCard} transparent animationType="fade" onRequestClose={() => setSelectedCard(null)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSelectedCard(null)}>
          <View style={s.modalCard}>
            <TouchableOpacity style={s.modalClose} onPress={() => setSelectedCard(null)}>
              <Ionicons name="close" size={20} color={TEXT_DIM} />
            </TouchableOpacity>
            {selectedCard && (
              <>
                <View style={s.modalImgWrap}>
                  <Image source={selectedCard.img} style={s.modalImg} contentFit="cover" />
                </View>
                <Text style={s.modalName}>{selectedCard.name}</Text>
                <View style={s.modalDivider} />
                <Text style={s.modalMeaning}>{selectedCard.meaning}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  headerRight: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headerIcon: { width: 36, height: 36, borderRadius: 10 },

  scroll: { paddingBottom: 40 },

  // Banner
  bannerWrap: { marginHorizontal: 16, marginTop: 4 },
  banner: { height: 160, borderRadius: 16, overflow: 'hidden' },
  bannerImage: { borderRadius: 16 },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 },
  bannerLogo: { width: 120, height: 60, marginBottom: 8 },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  bannerSub: { fontSize: 13, color: ACCENT, marginTop: 4 },

  // Intro
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK, paddingHorizontal: 16, marginTop: 20, marginBottom: 4 },
  desc: { fontSize: 14, color: TEXT_MID, paddingHorizontal: 16, marginTop: 6 },
  descSub: { fontSize: 13, color: TEXT_DIM, paddingHorizontal: 16, marginTop: 4, lineHeight: 18 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 0 },
  catCard: { width: '25%', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  catIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catLabel: { fontSize: 11, fontWeight: '600', color: TEXT_DARK, textAlign: 'center' },

  spreadPreview: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 },
  previewCardWrap: { alignItems: 'center', gap: 8 },
  previewCard: { width: 90, height: 130, borderRadius: 12, backgroundColor: '#1D1D1C', borderWidth: 2, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  previewLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MID },

  drawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, marginHorizontal: 16, marginTop: 24, paddingVertical: 14 },
  drawBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  resetBtn: { alignItems: 'center', marginTop: 14, paddingVertical: 10 },
  resetTxt: { fontSize: 14, fontWeight: '600', color: ACCENT },

  // Spread
  spreadRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16, paddingHorizontal: 16 },
  spreadCardWrap: { alignItems: 'center' },
  spreadPosition: { fontSize: 11, fontWeight: '600', color: ACCENT, marginBottom: 6 },
  spreadCard: { width: 100, height: 150, borderRadius: 12, overflow: 'hidden' },
  spreadFace: { position: 'absolute', width: 100, height: 150, borderRadius: 12, backfaceVisibility: 'hidden' },
  spreadFront: { backgroundColor: '#1D1D1C', borderWidth: 2, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 4 },
  frontLabel: { fontSize: 20, fontWeight: 'bold', color: ACCENT },
  spreadBack: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  spreadThumbFull: { width: 180, height: 260, borderRadius: 12, marginLeft: -40, marginTop: -55 },
  spreadName: { fontSize: 11, fontWeight: '600', color: TEXT_DARK, marginTop: 6, textAlign: 'center' },

  // Summary
  summaryCard: { marginHorizontal: 16, marginTop: 20, backgroundColor: CARD_BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER, gap: 14 },
  summaryItem: {},
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  summaryDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 18 },

  // Chat
  chatContent: { padding: 14, paddingBottom: 10 },
  chatRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  chatRowRight: { justifyContent: 'flex-end' },
  chatAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT + '20', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  chatBubble: { maxWidth: '78%', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chatBubbleUser: { backgroundColor: ACCENT, borderBottomRightRadius: 2 },
  chatBubbleAI: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderBottomLeftRadius: 2 },
  chatText: { fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  chatTextUser: { color: '#fff' },

  chatInputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#E8E8E8', backgroundColor: '#FAFAFA' },
  chatInputWrap: { flex: 1, backgroundColor: CARD_BG, borderRadius: 20, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 8 : 4 },
  chatInput: { fontSize: 14, color: TEXT_DARK, maxHeight: 100, padding: 0 },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%', maxHeight: '80%' },
  modalClose: { position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  modalImgWrap: { width: 200, height: 260, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  modalImg: { width: 260, height: 360, borderRadius: 14, marginLeft: -30, marginTop: -50 },
  modalName: { fontSize: 22, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 8 },
  modalDivider: { width: 40, height: 2, backgroundColor: ACCENT, borderRadius: 1, marginBottom: 12 },
  modalMeaning: { fontSize: 15, color: TEXT_MID, textAlign: 'center', lineHeight: 22 },
});
