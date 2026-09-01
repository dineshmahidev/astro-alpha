# AI Implementation in Koshmira

## Overview
Koshmira uses AI in two places: **Palm Reading Chat** and **AI Specialist Chat**. All AI calls go through a free provider fallback system with no API keys needed.

---

## 1. Free AI Provider System

**File:** `lib/ai/providers.ts`

### Providers (in priority order)
| Priority | Provider | Model | API Key | Cost |
|----------|----------|-------|---------|------|
| 1 | LLM7.io | `turbo` | None | Free |
| 2 | LLM7.io | `meta-Llama-3.1-8B-Instruct-Turbo` | None | Free |

### How it works
```
callAIWithFallback(messages)
  → Try LLM7.io Turbo (15s timeout)
  → If fails → Try LLM7.io Llama (15s timeout)
  → If all fail → return null (caller uses local fallback)
```

### API Format
All providers use OpenAI-compatible format:
```
POST {baseURL}/chat/completions
{
  model: "turbo",
  messages: [{ role: "system"|"user"|"assistant", content: "..." }],
  max_tokens: 500
}
```

---

## 2. Palm Reading Chat

**File:** `app/(tabs)/palms.tsx`

### Flow
1. User scans palm (right hand = karma, left hand = destiny)
2. Local engine generates `PalmReading` with lines, traits, metrics
3. User asks question → chat sends to AI with palm data in system prompt
4. AI replies in Tanglish/Hindi/English based on language setting
5. If AI fails → falls back to local pattern-matching engine

### System Prompt
```
You are an expert Vedic palmist analyzing both hands.
RIGHT hand = effort/karma. LEFT hand = destiny/sanchita.
Reply in Tanglish/Tamil/Hindi/English.
Palm data: {summary, lines, traits, metrics}
Keep answers 3-5 sentences. Warm, mystical tone.
```

### Fallback
- **Primary:** Free AI providers (LLM7.io)
- **Secondary:** Local pattern-matching engine (`lib/palm/chat.ts`)
- Works offline, no API needed

---

## 3. AI Specialist Chat

**File:** `app/ai/[id].tsx`

### 7 Specialists
| ID | Name (EN) | Name (TA) | Focus |
|----|-----------|-----------|-------|
| health | Health Advisor | சுகாதார ஆலோசகர் | Health tips & remedies |
| wealth | Wealth & Business | செல்வம் & வணிகம் | Money, career, investments |
| marriage | Marriage & Love | திருமணம் & காதல் | Love, compatibility |
| career | Career Coach | தொழில் வழிகாட்டி | Job, growth, promotions |
| education | Education Guide | கல்வி வழிகாட்டி | Studies, exams |
| family | Family Astrologer | குடும்ப ஜோதிடர் | Home, peace, bonds |
| remedies | Remedies Guide | பரிகார வழிகாட்டி | Mantras, gems, rituals |

### System Prompt
```
You are {specialist}, a friendly {tagline} in Koshmira app.
User: {name}, DOB: {dob}, Birth Time: {tob}, Place: {place},
Rashi: {rashi}, Nakshatra: {nakshatra}, Gothram: {gothram}

CRITICAL: Reply in Tanglish (Tamil words in English script).
DO NOT reply in pure English.
Be warm like South Indian paatti/thatha doing jyotish.
Use Vedic concepts: planets, houses, nakshatras, dasha, dosham.
3-5 sentences max. Ask one follow-up.
```

### Flow
1. User selects specialist → chat opens
2. System prompt includes user's birth details from auth context
3. User asks question → sends to AI with chat history
4. AI replies in Tanglish using user's actual rashi/nakshatra/gothram
5. Chat history persisted in AsyncStorage

---

## 4. Local Palm Chat Engine (Offline Fallback)

**File:** `lib/palm/chat.ts`

### Features
- Pattern-matching Q&A engine
- Supports Tamil, Hindi, English
- Works completely offline
- No API calls needed

### When used
- All AI providers fail
- User is offline
- As backup for reliability

---

## 5. User Data in AI Context

**Source:** `contexts/auth-context.tsx`

### Data passed to AI
```typescript
{
  name: user.name,           // "Kumbarasi"
  dob: birthDetails.dob,     // "1990-05-15"
  tob: birthDetails.tob,     // "10:30"
  place: birthDetails.place, // "Chennai"
  rashi: birthDetails.rashi, // "Simha (Leo)"
  nakshatra: birthDetails.nakshatra, // "Uthram"
  gothram: birthDetails.gothram,     // "Bharadwaj"
}
```

---

## 6. Language Support

| Language | AI Reply Style | Example |
|----------|---------------|---------|
| Tamil (ta) | Tanglish | "Vanakkam! Un health romba nalla irukkum today..." |
| Hindi (hi) | Hinglish | "Namaste! Aapka health bahut accha hai..." |
| English (en) | English + Tamil terms | "Your health looks good, Rahu kaalam is favorable..." |

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────┐
│              User Input                      │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Palm Chat Screen   │
        │   OR AI Specialist   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Build System Prompt │
        │  + User Birth Data   │
        │  + Chat History      │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ callAIWithFallback() │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌────▼────┐    ┌────▼────┐
│LLM7   │    │LLM7     │    │ Local   │
│Turbo  │→   │Llama    │→   │ Engine  │
│(Free) │    │(Free)   │    │(Offline)│
└───────┘    └─────────┘    └─────────┘
```

---

## 8. Files Summary

| File | Purpose |
|------|---------|
| `lib/ai/providers.ts` | Free AI provider config + fallback logic |
| `lib/palm/chat.ts` | Local pattern-matching engine (offline) |
| `lib/palm/reading.ts` | Palm reading analysis engine |
| `app/(tabs)/palms.tsx` | Palm reading screen with AI chat |
| `app/ai/[id].tsx` | AI specialist chat screen |
| `constants/ai-specialists.ts` | Specialist definitions (7 specialists) |
| `contexts/auth-context.tsx` | User data (name, rashi, nakshatra, gothram) |
