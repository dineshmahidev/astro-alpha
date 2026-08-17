export type Astrologer = {
  id: string;
  name: string;
  avatar: string;
  mobile: string;
  lastMsg: string;
  time: string;
  rating: string;
  specialty: string;
  location: string;
  experience: string;
  bio: string;
};

export const ASTROLOGERS: Astrologer[] = [
  {
    id: 'a1',
    name: 'Pt. Rahul',
    avatar: 'https://i.pravatar.cc/150?img=12',
    mobile: '+91 98765 43210',
    lastMsg: 'Your horoscope looks very positive this week.',
    time: '10:32 AM',
    rating: '4.8',
    specialty: 'Kundli, Horoscope',
    location: 'Delhi, India',
    experience: '12+ years',
    bio: 'A renowned Vedic astrologer specialising in detailed kundli analysis and personalised horoscope readings.',
  },
  {
    id: 'a2',
    name: 'Astro Meera',
    avatar: 'https://i.pravatar.cc/150?img=47',
    mobile: '+91 91234 56789',
    lastMsg: 'Let me check your birth chart first.',
    time: 'Yesterday',
    rating: '4.9',
    specialty: 'Match Making',
    location: 'Mumbai, India',
    experience: '9+ years',
    bio: 'Expert in match making and relationship astrology, guiding couples toward harmonious unions for over a decade.',
  },
  {
    id: 'a3',
    name: 'Guru Anil',
    avatar: 'https://i.pravatar.cc/150?img=68',
    mobile: '+91 90000 12345',
    lastMsg: 'The planets are aligned in your favour.',
    time: 'Mon',
    rating: '4.6',
    specialty: 'Vastu, Remedies',
    location: 'Jaipur, India',
    experience: '15+ years',
    bio: 'Vastu and remedial astrology master, helping people harmonise their living spaces and solve life challenges.',
  },
  {
    id: 'a4',
    name: 'Pandit Suresh',
    avatar: 'https://i.pravatar.cc/150?img=15',
    mobile: '+91 88888 77777',
    lastMsg: 'Call me after 5 PM for the full reading.',
    time: 'Sun',
    rating: '4.7',
    specialty: 'Muhurat, Puja',
    location: 'Varanasi, India',
    experience: '20+ years',
    bio: 'Traditional pandit specialising in auspicious muhurat selection and sacred puja rituals with deep scriptural knowledge.',
  },
  {
    id: 'a5',
    name: 'Astro Kavya',
    avatar: 'https://i.pravatar.cc/150?img=45',
    mobile: '+91 95555 44444',
    lastMsg: 'Your marriage compatibility report is ready.',
    time: 'Sat',
    rating: '4.9',
    specialty: 'Vedic Astrology',
    location: 'Bengaluru, India',
    experience: '7+ years',
    bio: 'Vedic astrology specialist known for accurate predictions and compassionate guidance on career and relationships.',
  },
];
