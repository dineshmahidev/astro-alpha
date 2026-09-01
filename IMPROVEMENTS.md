# Koshmira App - Screen-by-Screen Improvement Guide
## For Tamil User Base

> Read this file, decide what to keep/remove, and I'll implement your choices.

---

## 1. HOME SCREEN (`index.tsx`)

### What's Good
- Gold gradient identity card (rashi/nakshatra) looks premium
- Language-aware font sizing works well for Tamil
- Wallet/credits pill for monetization
- Quick actions for top features

### Remove / Fix
- Dead code: `HEADER_COLOR` constant never used in styles
- Dead style: `astroAvatar` defined but never referenced
- Hardcoded English fallback horoscope text

### Add (Tamil Priority)
- **நல்ல நேரம் (Nalla Neram)** + **ராகு காலம் (Rahu Kalam)** section — #1 daily feature for Tamil users
- **Today's Thithi/Panchang** summary card
- Palm Reading (கைரேகை) in quick actions — missing
- Share horoscope on WhatsApp button
- Loading skeleton when birth data loads

### UI Fix
- Astrologer card width 130px — Tamil names truncate on small screens
- Horoscope fallback text hardcoded English only

---

## 2. CHAT SCREEN (`chat.tsx`)

### What's Good
- Stories-style avatar row + AI specialist cards
- GoldGlow animation on AI cards
- Clean dual-section layout

### Remove / Fix
- 4 simultaneous `GoldGlow` animation loops — performance heavy
- `router.push('/ai' as any)` — broken route, `as any` cast
- Hardcoded English: "Chat", "AI Specialists", "Astrologer Chat"

### Add (Tamil Priority)
- "Available now" / "Last seen" status for each astrologer
- Unread message count badges
- Search/filter astrologers by name
- Tamil astrologer names in the list
- "Free consultation available" badge for new users

### UI Fix
- No touch feedback (`activeOpacity`) on chat list items
- Combine stories row + AI section into one horizontal scroll

---

## 3. ASTROLOGER TAB (`astrologer.tsx`)

### What's Good
- Role-based rendering (user vs astrologer dashboard)
- Category filter chips
- Dashboard with consultation count + earnings

### Remove / Fix
- "Vastu" and "Specialist" category filters — no astrologers match these
- "Call" button navigates to same profile as "Chat" — misleading
- Duplicate padding: `card.marginHorizontal: 16` + `content.padding: 16` = 32px total

### Add (Tamil Priority)
- Search bar for astrologers by name
- Sort by rating / experience
- "Online now" green dot indicator
- Tamil category names: "குண்டலி", "திருமண பொருத்தம்", "வேத ஜோதிடம்"
- Dashboard strings in Tamil

### UI Fix
- No pull-to-refresh on dashboard
- Dashboard consultations route may not exist (`/chat-room/[id]`)

---

## 4. ACCOUNT SCREEN (`account.tsx`)

### What's Good
- Language switcher with native scripts (EN/TA/HI)
- Favourites with AsyncStorage persistence
- Order history from match:history
- Wallet card for monetization

### Remove / Fix
- Settings modal is **duplicate** — same content already on main screen (language card + edit button)
- Branding inconsistency: Logout says "My Astro" but app is "Koshmira"
- `StoredMatchRecord` type likely duplicated elsewhere

### Add (Tamil Priority)
- **Share on WhatsApp** / "WhatsApp இல் பகிர்" — Tamil users share astrology content heavily
- Notification preferences (daily horoscope toggle)
- Delete Account option (Google Play requirement)
- About section (app version, how credits work)
- WhatsApp support link (not mailto — many Android devices lack email app)

### UI Fix
- Menu items hardcoded English: "My Kundli", "Order History", "Favourites", etc.
- No press feedback color on menu rows
- Modal maxHeight 75% may clip favourites list

---

## 5. PALM READING (`palms.tsx`)

### What's Good
- VisionCamera + MediaPipe hand detection — sophisticated
- Dual input (camera + gallery)
- Chat follow-up within result modal
- Tamil suggestion pills already implemented

### Remove / Fix
- `syntheticLandmarks` fallback — misleading if hand detection fails
- `useEffect` writes AsyncStorage on every state change — debounce needed

### Add (Tamil Priority)
- **Left/Right hand selection** — palm reading differs (destiny vs effort)
- "How to place your palm" guide with illustration
- Result sharing capability
- "Consult astrologer about your palm" CTA button
- Tamil line names: "உயிர்க் கோடு", "இதயக் கோடு", "தலைக் கோடு", "விதிக் கோடு"

### UI Fix
- No loading indicator when hand detection is processing
- Chat section maxHeight 300 is cramped
- Disclaimer should appear before scan, not after result

---

## 6. ASTROLOGER PROFILE (`astrologer/[id].tsx`)

### What's Good
- Clean About/Reviews tab UI
- Hero section with avatar, rating, specialty
- Paid chat flow with payment recording

### Remove / Fix
- **Hardcoded fake reviews** — same 5 reviews shown for ALL astrologers. Deceptive.
- `CHAT_PRICE` hardcoded at ₹50 — should be configurable per astrologer
- Mobile number shown in header — privacy concern

### Add (Tamil Priority)
- Real reviews from database (or remove reviews entirely)
- Consultation pricing display before chat
- Availability schedule (online hours)
- WhatsApp chat option alongside Call
- Tamil astrologer names and lineage

### UI Fix
- Avatar component inconsistent (Avatar vs VectorAvatar)
- Services chips break on inconsistent specialty formatting

---

## 7. CHAT DETAIL (`chat/[id].tsx`)

### What's Good
- Standard chat UI layout
- Back nav with astrologer avatar
- KeyboardAvoidingView

### Remove / Fix
- **Entire chat is non-functional** — all messages hardcoded, TextInput has no state, send button has no handler
- Mobile number exposed in header — privacy issue
- No message persistence

### Add (Tamil Priority)
- Actually working message send/receive
- Message timestamps
- Tamil greeting: "வணக்கம்" instead of "Namaste"
- Voice message support (elderly Tamil users prefer speaking)
- Share birth chart button in chat input
- Typing indicator

### UI Fix
- Messages not in FlatList — will break with many messages
- No scroll-to-bottom on new messages
- Input lacks multiline support

---

## 8. TAROT SCREEN (`tarot.tsx`)

### What's Good
- Full 78-card deck with images
- Shuffle animation
- 3-card spread with paging scroll
- "Draw again" limitation adds authenticity

### Remove / Fix
- 78 card images loaded eagerly — bundle size concern
- `combinationText` reads awkwardly ("Then... And finally...")
- All strings hardcoded English

### Add (Tamil Priority)
- Past/Present/Future card position labels
- "What is Tarot?" intro for Tamil users unfamiliar with it
- Save/share reading capability
- Reading history (previous readings lost on redraw)
- Card meanings in Tamil

### UI Fix
- "What's Happening?" button text unclear — rename to "View Full Reading"
- `btnGold` padding too large for narrow screens
- Shuffle animation only 900ms — could be longer

---

## 9. MATCH MAKING (`match.tsx`)

### What's Good
- Most culturally relevant feature — "திருமண பொருத்தம்"
- Dual input modes (auto/manual)
- Real Vedic astronomy engine
- Porutham results with explanations

### Remove / Fix
- `CITIES` array duplicates `PLACES` in `birth.ts`
- `MALE_AVATARS`/`FEMALE_AVATARS` use tarot images — wrong theme
- `randomAvatar` reassigns on every render — flickering
- Unused `progressLabel` style

### Add (Tamil Priority)
- **Papa Dosham check** — critical for Tamil marriage matching
- Quick Check mode (just Rasi + Star porutham first)
- Tamil star name search ("மகம்" not just "Magha")
- Porutham explanations in Tamil
- Share/export result as image or PDF
- Temple-specific remedies for low compatibility

### UI Fix
- Two PersonFields stacked with no visual separator — add "VS" divider
- Result modal needs safe area insets (magic number marginTop: 36)
- Porutham rows need more prominent color coding

---

## 10. KUNDLI (`kundli.tsx`)

### What's Good
- Three chart styles (North/South/East Indian)
- Mahadasha timeline with age ranges
- Planet legend

### Remove / Fix
- `DASHA` array has **static/fixed** age ranges — not computed from actual birth time. Misleading.
- `REPORT` array is generic, not personalized
- `buildKundliChartData` only uses rashi index, not real positions

### Add (Tamil Priority)
- Rename "Kundli" → "ஜாதகம்" (Jathagam) for Tamil
- Real planet positions in chart (not mock)
- House (bhava) details
- Planetary aspects (drishti)
- Download/share kundli as PDF — families share with marriage prospects
- Tamil labels: "லக்னம்", "ராசி", "நட்சத்திரம்", "பாதம்"

### UI Fix
- Legend text dense and small
- No loading state
- Chart switcher could use preview thumbnails

---

## 11. JATHAGAM (`jathagam.tsx`)

### What's Good
- Most feature-rich screen — complete Panchangam
- Real `computeAstroReport` with positions, houses, navamsa, dasha
- Dosha detection with severity + remedies
- Daily horoscope integration

### Remove / Fix
- **Typo**: "Seva (Sarpa) Dosha" — "Seva" means service. Should be "Sarpa" (serpent).
- `PLANET_LABELS` hardcoded English
- Dosha explanation text English only

### Add (Tamil Priority)
- Rename title to "ஜாதகம்" in Tamil
- "சர்ப்ப தோஷம்" (Sarpa Dosham) prominently displayed
- "ராகு காலம்" + "குளிகை" from panchanga data
- Temple-specific remedies (e.g., "Rahu-Ketu pooja at Thirunageswaram")
- Tamil labels: "திதி", "பக்ஷம்", "வாரம்", "யோகம்", "கரணம்"

### UI Fix
- Very long scrollable screen — add section jump navigation
- Planet icon-to-planet mapping is generic (Mercury uses chat icon)
- Navamsa only visible to astrologers — show simplified version to all

---

## 12. HOROSCOPE (`horoscope.tsx`)

### What's Good
- Clean hero card with personalized horoscope
- Grid of all 12 zodiac signs
- Real Vedic engine computation

### Remove / Fix
- Only shows "General" category — other categories (Career, Finance, etc.) not shown
- Grid uses Western zodiac names — should use Vedic/Tamil

### Add (Tamil Priority)
- Title: "இன்றைய ராசி பலன்" in Tamil
- Tamil rashi names in grid: "மேஷம்", "ரிஷபம்", "மிதுனம்"
- "அதிர்ஷ்ட எண்" (Lucky Number) + "அதிர்ஷ்ட நிறம்" (Lucky Color)
- "பரிகாரம்" (Remedy) for each sign
- Weekly/monthly horoscope option
- Share reading button

### UI Fix
- Hero card background too high-contrast for bright sunlight
- Grid items small on larger phones
- Tapping sign only shows General — show all categories

---

## 13. LOGIN (`login.tsx`)

### What's Good
- Clean minimal design
- Google Sign-In properly implemented
- Returning user routing logic
- Thorough loading state management

### Remove / Fix
- `console.log` debug statements — remove for production
- **Branding inconsistency**: login says "My Astro", home says "Koshmira"
- Privacy text too small and generic

### Add (Tamil Priority)
- Phone number / OTP login — many older Tamil users lack Google accounts
- Apple Sign-In (iOS App Store requirement)
- Guest mode / Skip login — explore before signing in
- Default Tamil language for Tamil locale devices
- Tamil tagline: "நட்சத்திரங்களின் தினசரி வழிகாட்டி"

### UI Fix
- Logo is generic Ionicons planet — use custom app logo
- Lots of vertical white space — center login card better
- No error feedback for failed sign-in

---

## 14. ONBOARDING (`onboarding.tsx`)

### What's Good
- Progressive 3-step form with progress bar
- "I don't know exact time" toggle with rashi/nakshatra alternative
- Birth time warning
- Place autocomplete

### Remove / Fix
- Zodiac card row on every step — decorative but distracting during data entry
- Gender "Other" has no Vedic astrology context

### Add (Tamil Priority)
- Tamil step titles: "உங்களைப் பற்றி சொல்லுங்கள்", "பிறந்த தேதி & நேரம்", "பிறந்த இடம்"
- Tamil gender labels: "ஆண்", "பெண்", "மற்றவை"
- Rashi/Nakshatra picker in Tamil: "மேஷம்", "அஸ்வினி" (not "Mesha", "Ashwini")
- "உங்கள் குலம் / Gothram" field — important for Tamil Brahmin matchmaking
- "How do I find my Rashi?" help link
- GPS/location for birth place
- Inline field validation errors

### UI Fix
- Progress bar too thin (6px)
- Final step says "Continue" — should say "Save" / "Finish"
- Keyboard covers inputs on Android

---

## CROSS-CUTTING ISSUES

### 1. Branding — PICK ONE NAME
- Home: "Koshmira"
- Login: "My Astro"
- Login translation: "My Astro-க்கு வரவேற்கிறோம்"
- **Decision needed**: Koshmira or My Astro?

### 2. Hardcoded English Strings
These screens bypass the `uiStrings` i18n system entirely:
- `chat.tsx`: "Chat", "AI Specialists", "Astrologer Chat"
- `astrologer.tsx`: All dashboard strings
- `account.tsx`: All menu items
- `tarot.tsx`: Every single string
- `kundli.tsx`: All section titles
- `horoscope.tsx`: All labels
- `login.tsx`: App name, tagline
- `onboarding.tsx`: All labels and instructions

### 3. Birth Constants Missing Tamil
`constants/birth.ts` uses Sanskrit transliteration ("Mesha", "Ashwini") — Tamil users expect "மேஷம்", "அஸ்வினி"

### 4. Missing #1 Tamil Feature
**நல்ல நேரம் + ராகு காலம்** — panchanga data is computed in jathagam.tsx but never surfaced on home screen. This is the single most daily-checked feature for Tamil users.

### 5. Dark Theme in Sunlight
All screens use `#121212` / `#1D1D1C` backgrounds — hard to read in bright Tamil Nadu sunlight. Consider light mode option.

### 6. Background Image Pattern
Some screens use `<Image>` with `absoluteFill`, others use `<ImageBackground>`. Standardize to one approach.

### 7. Share/WhatsApp Missing Everywhere
No screen has a share button. Tamil users share astrology content on WhatsApp constantly.

### 8. Phone Login Missing
Only Google Sign-In — many Tamil users (especially older) need phone/OTP login.
