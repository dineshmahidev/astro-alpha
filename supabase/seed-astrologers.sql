-- Run this in Supabase → SQL Editor to add real astrologers
-- These users will automatically get 'astrologer' role when they sign in with Google

insert into public.astrologers (id, email, name, avatar, mobile, rating, specialty, location, experience, bio) values
  ('a1', 'dineshmahi02@gmail.com', 'Pt. Dinesh', '', '', 4.9, 'Kundli, Horoscope, Vedic Astrology', 'Erode, India', '10+ years', 'Vedic astrology specialist with deep knowledge in kundli analysis and horoscope readings.'),
  ('a2', 'dinesh.mahi.dev@gmail.com', 'Astro Dinesh', '', '', 4.8, 'Match Making, Marriage, Compatibility', 'Erode, India', '8+ years', 'Expert in match making and relationship compatibility analysis.'),
  ('a3', 'monstermahid@gmail.com', 'Guru Mahid', '', '', 4.9, 'Career, Finance, Remedies', 'Chennai, India', '12+ years', 'Specialist in career guidance, financial astrology and traditional remedies.')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  avatar = excluded.avatar,
  mobile = excluded.mobile,
  rating = excluded.rating,
  specialty = excluded.specialty,
  location = excluded.location,
  experience = excluded.experience,
  bio = excluded.bio;
