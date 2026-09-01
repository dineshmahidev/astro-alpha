/**
 * LOCAL PALM READING CHAT ENGINE
 * ------------------------------
 * Answers questions about a palm reading without any backend.
 * Pattern-matches keywords in the user's question and responds
 * using the reading data + predefined knowledge.
 */

import type { AppLanguage } from '@/constants/i18n';
import type { PalmReading } from './reading';

type ChatMsg = { role: 'user' | 'assistant'; text: string };

const QA_EN: { pattern: RegExp; answer: (r: PalmReading) => string }[] = [
  {
    pattern: /life\s*line|உயிர்க்\s*கோடு|जीवन\s*रेखा/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.toLowerCase().includes('life line'));
      return idx >= 0
        ? `Your life line: ${r.lines[idx]}\n\nIn palmistry the life line reflects vitality and physical energy — not how long you will live. A strong life line shows robust constitution and resilience.`
        : 'Your life line appears well-formed. It reflects physical vitality and constitution.';
    },
  },
  {
    pattern: /heart\s*line|இதயக்\s*கோடு|हृदय\s*रेखा/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.toLowerCase().includes('heart line'));
      return idx >= 0
        ? `Your heart line: ${r.lines[idx]}\n\nThe heart line reveals emotional nature and romantic tendencies. It shows how you express love and handle relationships.`
        : 'Your heart line is balanced. It shows a healthy approach to emotions and relationships.';
    },
  },
  {
    pattern: /head\s*line|தலைக்\s*கோடு|मस्तिष्क\s*रेखा/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.toLowerCase().includes('head line'));
      return idx >= 0
        ? `Your head line: ${r.lines[idx]}\n\nThe head line reflects thinking style and intellectual approach. It reveals how you process information and make decisions.`
        : 'Your head line shows a balanced mind — practical thinking with good intuition.';
    },
  },
  {
    pattern: /fate\s*line|விதிக்\s*கோடு|भाग्य\s*रेखा/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.toLowerCase().includes('fate line'));
      return idx >= 0
        ? `Your fate line: ${r.lines[idx]}\n\nThe fate line indicates career path and life direction. Not everyone has a clear fate line — its absence means you forge your own path.`
        : 'Your fate line shows a steady career progression. Success comes through consistent effort.';
    },
  },
  {
    pattern: /career|தொழில்|கரியர்|करियर|work|job|business/i,
    answer: (r) => {
      const fate = r.lines.find((l) => l.toLowerCase().includes('fate line')) || r.lines[3];
      const comm = r.lines[4];
      return `Career reading:\n• ${fate}\n• ${comm}\n\nYour palm suggests ${r.traits[3]?.toLowerCase() || 'strong determination'}. Best suited for roles that value your natural ${r.traits[4]?.toLowerCase() || 'communication style'}.`;
    },
  },
  {
    pattern: /love|காதல்|காதல்|प्रेम|romantic|marriage|திருமணம்/i,
    answer: (r) => {
      const heart = r.lines.find((l) => l.toLowerCase().includes('heart line')) || r.lines[1];
      return `Love & Relationships:\n• ${heart}\n\nYou are ${r.traits[1]?.toLowerCase() || 'emotionally balanced'}. In relationships, you value ${r.traits[1]?.toLowerCase().includes('passionate') ? 'deep connection and loyalty' : 'stability and mutual respect'}.`;
    },
  },
  {
    pattern: /strength|பலம்|ताकत|power|good\s*at|வல்லமை/i,
    answer: (r) => `Your key strengths:\n${r.traits.map((t) => '• ' + t).join('\n')}\n\nThese qualities are woven into your hand geometry and are naturally present in your character.`,
  },
  {
    pattern: /health|உடல்நலம்|स्वास्थ्य|உடல்/i,
    answer: (r) => {
      const life = r.lines[0];
      return `Health indication:\n• ${life}\n\nRemember: palm reading is entertainment, not medical advice. Always consult a healthcare professional for health concerns.`;
    },
  },
  {
    pattern: /money|பணம்|पैसा|wealth|finance|செல்வம்/i,
    answer: (r) => {
      const fate = r.lines[3];
      return `Wealth potential:\n• ${fate}\n\nYour palm indicates ${r.traits[3]?.toLowerCase() || 'steady progress'}. Financial success comes through your natural approach to work and persistence.`;
    },
  },
  {
    pattern: /summary|சுருக்கம்|सारांश|overall|என்ன\s*சொல்கிறது|பலன்/i,
    answer: (r) => r.summary,
  },
];

const QA_TA: { pattern: RegExp; answer: (r: PalmReading) => string }[] = [
  {
    pattern: /உயிர்க்\s*கோடு|life\s*line/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.includes('உயிர்க் கோடு'));
      return idx >= 0
        ? `உங்கள் உயிர்க் கோடு: ${r.lines[idx]}\n\nகைரேகையில் உயிர்க் கோடு உடல் ஆரோக்கியம் மற்றும் உயிர்ப்பை பிரதிபலிக்கிறது — இது எவ்வளவு காலம் வாழ்வீர்கள் என்பதல்ல. வலுவான உயிர்க் கோடு வலுவான உடலமைப்பைக் குறிக்கிறது.`
        : 'உங்கள் உயிர்க் கோடு நன்கு வளர்ந்துள்ளது. இது உடல் உயிர்ப்பை பிரதிபலிக்கிறது.';
    },
  },
  {
    pattern: /இதயக்\s*கோடு|heart\s*line/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.includes('இதயக் கோடு'));
      return idx >= 0
        ? `உங்கள் இதயக் கோடு: ${r.lines[idx]}\n\nஇதயக் கோடு உணர்வு இயல்பு மற்றும் காதல் போக்குகளை வெளிப்படுத்துகிறது. நீங்கள் எப்படி காதலை வெளிப்படுத்துகிறீர்கள் மற்றும் உறவுகளை கையாளுகிறீர்கள் என்பதை காட்டுகிறது.`
        : 'உங்கள் இதயக் கோடு சமநிலையாக உள்ளது. உணர்வுகள் மற்றும் உறவுகளில் ஆரோக்கியமான அணுகுமுறையை காட்டுகிறது.';
    },
  },
  {
    pattern: /தலைக்\s*கோடு|head\s*line/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.includes('தலைக் கோடு'));
      return idx >= 0
        ? `உங்கள் தலைக் கோடு: ${r.lines[idx]}\n\nதலைக் கோடு சிந்தனை பாணி மற்றும் அறிவு அணுகுமுறையை பிரதிபலிக்கிறது.`
        : 'உங்கள் தலைக் கோடு சமநிலையான மனதை காட்டுகிறது.';
    },
  },
  {
    pattern: /தொழில்|career|work|job|business/i,
    answer: (r) => `தொழில் பலன்:\n• ${r.lines[3]}\n• ${r.lines[4]}\n\nஉங்கள் கை இயல்பான ${r.traits[3]?.toLowerCase() || 'திறமையை'} குறிக்கிறது.`,
  },
  {
    pattern: /காதல்|love|romantic|marriage|திருமணம்/i,
    answer: (r) => `காதல் & உறவுகள்:\n• ${r.lines[1]}\n\nநீங்கள் ${r.traits[1]?.toLowerCase() || 'சமநிலையான உணர்வுகள்'}. உறவுகளில் ${r.traits[1]?.toLowerCase().includes('passionate') ? 'ஆழமான பிணைப்பு மற்றும் விசுவாசம்' : 'நிலைத்தன்மை மற்றும் மரியாதை'} முக்கியம்.`,
  },
  {
    pattern: /பலம்|strength|power|good\s*at/i,
    answer: (r) => `உங்கள் முக்கிய பலங்கள்:\n${r.traits.map((t) => '• ' + t).join('\n')}\n\nஇந்த குணங்கள் உங்கள் கை அளவியலில் பின்னிப் பிணைந்துள்ளன.`,
  },
  {
    pattern: /சுருக்கம்|summary|overall|என்ன\s*சொல்கிறது|பலன்/i,
    answer: (r) => r.summary,
  },
];

const QA_HI: { pattern: RegExp; answer: (r: PalmReading) => string }[] = [
  {
    pattern: /जीवन\s*रेखा|life\s*line/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.includes('जीवन रेखा'));
      return idx >= 0
        ? `आपकी जीवन रेखा: ${r.lines[idx]}\n\nहस्तरेखा में जीवन रेखा जीवन शक्ति और शारीरिक ऊर्जा को दर्शाती है — यह नहीं कि आप कितने साल जिएंगे। मजबूत जीवन रेखा स्वस्थ शरीर और सहनशक्ति का संकेत है।`
        : 'आपकी जीवन रेखा अच्छी बनी हुई है। यह शारीरिक जीवन शक्ति को दर्शाती है।';
    },
  },
  {
    pattern: /हृदय\s*रेखा|heart\s*line/i,
    answer: (r) => {
      const idx = r.lines.findIndex((l) => l.includes('हृदय रेखा'));
      return idx >= 0
        ? `आपकी हृदय रेखा: ${r.lines[idx]}\n\nहृदय रेखा भावनात्मक प्रकृति और प्रेम प्रवृत्तियों को दर्शाती है।`
        : 'आपकी हृदय रेखा संतुलित है। भावनाओं और रिश्तों में स्वस्थ दृष्टिकोण दिखाती है।';
    },
  },
  {
    pattern: /करियर|career|work|job|business/i,
    answer: (r) => `करियर रीडिंग:\n• ${r.lines[3]}\n• ${r.lines[4]}\n\nआपकी हथेली ${r.traits[3]?.toLowerCase() || 'दृढ़ संकल्प'} का संकेत देती है।`,
  },
  {
    pattern: /प्रेम|love|romantic|marriage|शादी/i,
    answer: (r) => `प्रेम और रिश्ते:\n• ${r.lines[1]}\n\nआप ${r.traits[1]?.toLowerCase() || 'संतुलित भावनाएं'} हैं। रिश्तों में ${r.traits[1]?.toLowerCase().includes('passionate') ? 'गहरा बंधन और वफादारी' : 'स्थिरता और सम्मान'} महत्वपूर्ण है।`,
  },
  {
    pattern: /ताकत|strength|power|good\s*at/i,
    answer: (r) => `आपकी प्रमुख ताकतें:\n${r.traits.map((t) => '• ' + t).join('\n')}\n\nये गुण आपकी हथेली की बनावट में गहराई से जुड़े हैं।`,
  },
  {
    pattern: /सारांश|summary|overall|क्या\s*कहता\s*है/i,
    answer: (r) => r.summary,
  },
];

function findAnswer(q: string, reading: PalmReading, lang: AppLanguage): string {
  const qa = lang === 'ta' ? QA_TA : lang === 'hi' ? QA_HI : QA_EN;
  const qLower = q.toLowerCase();
  for (const entry of qa) {
    if (entry.pattern.test(qLower)) return entry.answer(reading);
  }
  // fallback
  const fallbacks: Record<AppLanguage, string> = {
    en: `Based on your reading:\n${reading.lines.join('\n• ')}\n\nAsk me about a specific line (life, heart, head, fate), your career, love life, strengths, or request a summary.`,
    ta: `உங்கள் பலனின் அடிப்படையில்:\n${reading.lines.join('\n• ')}\n\nஒரு குறிப்பிட்ட கோடு, தொழில், காதல் வாழ்வு, பலங்கள் அல்லது சுருக்கம் பற்றி கேளுங்கள்.`,
    hi: `आपकी पढ़ाई के आधार पर:\n${reading.lines.join('\n• ')}\n\nकिसी विशिष्ट रेखा, करियर, प्रेम जीवन, ताकतों या सारांश के बारे में पूछें।`,
  };
  return fallbacks[lang] || fallbacks.en;
}

export function palmChatResponse(
  messages: ChatMsg[],
  reading: PalmReading,
  lang: AppLanguage,
): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return '';
  return findAnswer(lastUser.text, reading, lang);
}
