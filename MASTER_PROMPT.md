# Koshmira — Master Prompt for Building a Deterministic Astrology, Palmistry and Tarot AI Engine

Build a production-ready deterministic intelligence engine for the Koshmira app.

---

## CORE PHILOSOPHY

The LLM must NOT be the astrology calculation engine.

The system must follow this architecture:

```
User Profile + Birth Data
→ Astronomical / Astrology Calculation Engine
→ Structured Birth Chart
→ Derived Rules and Indicators
→ Specialist-Specific Analysis Engine
→ Palm Reading Engine
→ Tarot Interpretation Engine
→ Verified Structured Context
→ LLM Conversation Layer
```

The AI's job is only to:

1. Understand what the user is asking.
2. Identify which domain is relevant.
3. Retrieve the correct calculated data.
4. Explain ONLY the available calculated or detected results.
5. Adapt its language and tone to the user.
6. Never invent astrology calculations, palm features, tarot cards, planetary positions, dates, doshas, or predictions.

If required data is missing, the AI must clearly say that the calculation or reading is unavailable instead of guessing.

---

## PART 1 — USER DATA ENGINE

Use the following input:

```typescript
interface UserBirthData {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
```

Never calculate astrology from only:
- Rashi
- Nakshatra
- Name
- Date alone

For an accurate chart calculation, use:
- Date of birth
- Exact birth time
- Birth location
- Latitude
- Longitude
- Timezone

Store both:
- `rawBirthData`
- `calculatedAstrologyData`

The calculated data must be generated once and cached.

---

## PART 2 — ASTROLOGY CALCULATION ENGINE

Create a deterministic astrology calculation engine.

The engine must calculate:

### Planetary Positions

Calculate the exact position of:
- Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu

For every planet return:

```typescript
interface PlanetPosition {
  planet: string;
  longitude: number;
  sign: string;
  signDegree: number;
  nakshatra: string;
  nakshatraPada: number;
  house: number;
  retrograde: boolean;
  combustion?: boolean;
}
```

Do not ask the LLM to determine these positions. Use a proper astronomy or astrology calculation library/service.

---

## PART 3 — ASCENDANT AND 12 HOUSES

Calculate the exact Ascendant (Lagna) from:
- Birth date, Birth time, Latitude, Longitude, Timezone

Generate all 12 houses:

```typescript
interface HouseData {
  house: number;
  sign: string;
  signLord: string;
  planets: string[];
  strength: number;
}
```

House meanings (configurable rule metadata):

| House | Domain |
|-------|--------|
| 1st | Self, personality |
| 2nd | Family, speech, accumulated wealth |
| 3rd | Courage, communication |
| 4th | Home, mother, comfort |
| 5th | Education, creativity, romance, children |
| 6th | Work, competition, obstacles |
| 7th | Marriage and partnerships |
| 8th | Transformation and longevity |
| 9th | Fortune, beliefs, higher learning |
| 10th | Career and profession |
| 11th | Gains and networks |
| 12th | Expenses, isolation, spirituality |

---

## PART 4 — HOUSE ANALYSIS RULE ENGINE

Create a deterministic rule engine. Each specialist requests only relevant houses.

### Marriage Analysis

Uses:
- 7th House, 7th House Lord, Venus, Mars, 2nd House, 8th House
- Relevant Dasha, Transit, Marriage Yogas, Dosha Rules

```typescript
interface MarriageAnalysis {
  seventhHouse: HouseData;
  seventhLord: PlanetPosition;
  venus: PlanetPosition;
  marsDosha: DoshaResult;
  compatibilityIndicators: Indicator[];
  positiveFactors: Factor[];
  challengingFactors: Factor[];
  favorablePeriods: TimeWindow[];
  confidence: "high" | "medium" | "low";
}
```

---

## PART 5 — SEVVAI / MANGAL DOSHAM ENGINE

Create a separate configurable Mars Dosha engine. Do not let LLM decide dosha existence.

The rule engine must:
1. Identify Mars house placement
2. Apply configured traditional rule set
3. Store which rule set was used
4. Check configured exception/cancellation rules separately
5. Return a transparent result

```typescript
interface DoshaResult {
  detected: boolean;
  type: "sevvai_dosham";
  marsHouse: number;
  severity: "none" | "mild" | "moderate" | "strong";
  ruleSet: string;
  triggeredRules: string[];
  cancellationRules: string[];
  explanationData: string[];
}
```

Never invent a dosha. Only report if calculated result says detected = true.

---

## PART 6 — DASHA ENGINE

Calculate the user's Dasha timeline deterministically.

Support:
- Mahadasha
- Antardasha
- Pratyantar Dasha if required

```typescript
interface DashaPeriod {
  planet: string;
  level: "maha" | "antara" | "pratyantara";
  start: string;
  end: string;
}
```

Identify: Current Dasha, Upcoming Dasha, Specialist-relevant periods.

The AI must never calculate Dasha itself.

---

## PART 7 — TRANSIT ENGINE

Create a separate transit calculation module.

```typescript
interface TransitResult {
  date: string;
  planet: string;
  natalRelationship: string;
  affectedHouses: number[];
  significance: "low" | "medium" | "high";
}
```

Only send relevant results to the AI. Do not dump every transit.

---

## PART 8 — SPECIALIST DATA ROUTING

Separate analysis modules. LLM should not receive entire astrology database.

### General Astro Advisor
Access: Lagna, Rashi, Nakshatra, major planetary positions, current Dasha, relevant transits, important indicators

### Love and Marriage
Access: 5th House, 7th House, 7th Lord, Venus, Mars, Sevvai Dosha, relevant Dashas/Transits, compatibility data

### Career and Money
Access: 2nd, 6th, 10th, 11th Houses, house lords, Saturn, Jupiter, Mercury, career Dashas, transits, indicators

### Family and Home
Access: 2nd House, 4th House, Moon, family indicators, current Dasha, relevant transit

### Remedies
Must NOT invent remedies. Every remedy must have:

```typescript
interface Remedy {
  issue: string;
  tradition: string;
  remedy: string;
  sourceOrRuleId: string;
  optional: boolean;
}
```

Never force user to buy gemstones or perform expensive rituals.

---

## PART 9 — REACTION / INTERPRETATION ENGINE

Build an indicator system, not simple good/bad:

```typescript
interface Indicator {
  id: string;
  category: string;
  factor: string;
  condition: string;
  polarity: "positive" | "challenging" | "mixed";
  weight: number;
  evidence: string[];
}
```

Score internally for consistency. Never represent as scientific probability. Never hide negative indicators. Never exaggerate them.

---

## PART 10 — QUESTION UNDERSTANDING ENGINE

Before generating answer, classify user's question:

```
User Question
↓
Intent Detection
↓
Specialist Selection
↓
Required Data Selection
↓
Deterministic Engine
↓
Verified Result Object
↓
LLM Explanation
```

Examples:
- "Enakku marriage eppo?" → marriage_timing
- "Sevvai Dosham irukka?" → dosha_check
- "Love marriage chance?" → love_marriage_analysis
- "Job change panna nalla irukkuma?" → career_decision
- "Money growth eppo?" → financial_period
- "Enna parikaram pannanum?" → remedies

---

## PART 11 — PALM READING ENGINE

Structured pipeline:

```
Left Palm Image + Right Palm Image
↓
Image Quality Check
↓
Hand Landmark Detection
↓
Palm Orientation Detection
↓
Palm Line Detection
↓
Feature Measurement
↓
Traditional Palmistry Rule Engine
↓
Structured Palm Result
↓
AI Explanation
```

Detect and measure: Life Line, Head Line, Heart Line, Fate Line, Sun Line, Marriage Lines

```typescript
interface PalmLine {
  detected: boolean;
  confidence: number;
  length: number;
  depth: number;
  curvature: number;
  continuity: "continuous" | "broken" | "fragmented";
  branches: number;
}
```

Distinguish: Detected Feature vs Unclear Image vs Not Visible. Never treat "not visible" as "negative".

---

## PART 12 — LEFT HAND AND RIGHT HAND

```typescript
interface PalmReading {
  leftHand: PalmFeatures;
  rightHand: PalmFeatures;
}
```

Right Hand = Current tendencies / active choices
Left Hand = Inborn tendencies / baseline patterns

Compare both hands only when both readings have sufficient confidence.

---

## PART 13 — PALMISTRY RULE ENGINE

```typescript
interface PalmIndicator {
  feature: string;
  detectedValue: unknown;
  traditionalMeaning: string;
  confidence: number;
  evidence: string[];
}
```

IF confidence < threshold → "Indha photo-la antha line clear-aa theriyala. Konjam better lighting-la straight-aa palm photo upload pannunga."

---

## PART 14 — TAROT ENGINE

Complete deck configured. Each card:

```typescript
interface TarotCard {
  id: string;
  name: string;
  arcana: "major" | "minor";
  suit?: string;
  number?: number;
  uprightMeaning: {
    love?: string[];
    career?: string[];
    finance?: string[];
    general: string[];
  };
  reversedMeaning?: {
    love?: string[];
    career?: string[];
    finance?: string[];
    general: string[];
  };
}
```

Flow: Random Selection → Selected Card IDs → Orientation → Question Context → Card Meaning Database → AI Explanation

Never hallucinate a card. Only interpret actual selected cards.

---

## PART 15 — AI LANGUAGE ADAPTATION

Mirror the user's language naturally:
- Tamil script → Tamil script
- Tanglish → Tanglish
- English → English
- Mixed language → natural mixed language

Do not force any language. Maintain style throughout response.

---

## PART 16 — CONVERSATIONAL INTELLIGENCE

Do NOT:
- Repeat system prompt
- Repeat same answer
- Give random generic predictions
- Mention unrelated planets
- Add fake dates/positions
- Ask unnecessary questions
- Always say "Vanakkam"
- Always end with a question
- Use robotic templates

Use recent conversation history:

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  domain?: string;
  referencedAnalysisId?: string;
}
```

---

## PART 17 — MASTER LLM SYSTEM PROMPT

```
You are Koshmira's intelligent interpretation and conversation assistant.

Your role is NOT to independently calculate astrology, detect palm lines,
select tarot cards, or invent spiritual data.

You must use ONLY the verified structured context supplied to you.

CORE RULES:
1. First understand the user's actual question and conversation context.
2. Use only the provided calculated data.
3. NEVER invent: Planetary positions, Houses, Doshas, Dasha periods,
   Transit dates, Palm lines, Features, Tarot cards, Orientations,
   Remedies, Future dates, Missing user data.
4. If required data is unavailable, say so honestly.
5. Do not force every answer to mention astrology.
6. Explain reasoning naturally.
7. If positive and challenging indicators both exist, explain both fairly.
8. Never present prediction as guaranteed fact.
9. Do not be robotic or repetitive.
10. Adapt to user's actual language naturally.
11. Never force user into one language.
12. Match user's tone.
13. Remember recent conversation and resolve follow-up references.
14. Do not ask follow-up unless more information genuinely required.
15. Keep answer focused on user's exact question.

You are an INTERPRETER, not the calculation engine.
```

---

## PART 18 — CONTEXT FORMAT SENT TO THE AI

```json
{
  "user": { "name": "Dinesh" },
  "language": { "detected": "tanglish" },
  "question": {
    "text": "Enakku marriage eppo aagum?",
    "intent": "marriage_timing"
  },
  "verifiedAnalysis": {
    "positiveFactors": [],
    "challengingFactors": [],
    "favorablePeriods": [],
    "confidence": "medium"
  }
}
```

Never expose internal JSON directly to the user.

---

## PART 19 — DATA INTEGRITY

```typescript
interface AnalysisMetadata {
  calculatedAt: string;
  calculationVersion: string;
  ruleSetVersion: string;
  confidence?: number;
  sourceModules: string[];
}
```

---

## PART 20 — FINAL IMPLEMENTATION REQUIREMENTS

Build modularly:

```
lib/
  astrology/
    birth-chart.ts
    planets.ts
    houses.ts
    dasha.ts
    transits.ts
    doshas/
      mars-dosha.ts
    rules/
      marriage.ts
      career.ts
      family.ts

  palm/
    image-quality.ts
    landmarks.ts
    line-detection.ts
    feature-extraction.ts
    rules.ts

  tarot/
    cards.ts
    draw.ts
    interpretation.ts

  ai/
    intent-classifier.ts
    context-builder.ts
    language-detector.ts
    response-validator.ts
    providers.ts

  specialists/
    general.ts
    marriage.ts
    career.ts
    family.ts
    remedies.ts
```

Final system must ensure:

```
DETERMINISTIC CALCULATION
→ VERIFIED STRUCTURED DATA
→ DOMAIN-SPECIFIC ANALYSIS
→ AI EXPLANATION
```

The AI must never replace the deterministic engine. Provide transparent, consistent traditional interpretations based on configured rule sets and available input data. Do not claim guaranteed real-world prediction accuracy or supernatural certainty.
