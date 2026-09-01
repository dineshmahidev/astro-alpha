/**
 * TAROT DRAW ENGINE
 * -----------------
 * Deterministic card drawing and spread generation.
 * The LLM must only interpret cards that are actually drawn.
 */

import { TAROT_CARDS, TarotCard } from './cards';

export type SpreadType = 'single' | 'three_card' | 'celtic_cross';

export interface DrawnCard {
  position: string;
  card: TarotCard;
  orientation: 'upright' | 'reversed';
}

export interface TarotSpread {
  spread: SpreadType;
  cards: DrawnCard[];
  drawnAt: string;
}

const THREE_CARD_POSITIONS = ['past', 'present', 'future'];
const CELTIC_CROSS_POSITIONS = [
  'present',
  'challenge',
  'past',
  'future',
  'conscious',
  'subconscious',
  'advice',
  'environment',
  'hopes',
  'outcome',
];

/**
 * Draw cards for a spread. Uses Math.random() for true randomness.
 */
export function drawTarotSpread(spread: SpreadType, question?: string): TarotSpread {
  const positions = spread === 'three_card'
    ? THREE_CARD_POSITIONS
    : spread === 'celtic_cross'
      ? CELTIC_CROSS_POSITIONS
      : ['reading'];

  const cards: DrawnCard[] = positions.map((position) => {
    const card = getRandomCard();
    const orientation: 'upright' | 'reversed' = Math.random() > 0.5 ? 'upright' : 'reversed';
    return { position, card, orientation };
  });

  return {
    spread,
    cards,
    drawnAt: new Date().toISOString(),
  };
}

/**
 * Draw a single card.
 */
export function drawSingleCard(): DrawnCard {
  const card = getRandomCard();
  const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
  return {
    position: 'reading',
    card,
    orientation,
  };
}

/**
 * Draw a three-card spread (past, present, future).
 */
export function drawThreeCardSpread(): TarotSpread {
  return drawTarotSpread('three_card');
}

/**
 * Draw a Celtic Cross spread.
 */
export function drawCelticCrossSpread(): TarotSpread {
  return drawTarotSpread('celtic_cross');
}

function getRandomCard(): TarotCard {
  const index = Math.floor(Math.random() * TAROT_CARDS.length);
  return TAROT_CARDS[index];
}

/**
 * Get meaning of a drawn card based on question context.
 */
export function getCardMeaning(
  drawn: DrawnCard,
  question?: string,
): { meaning: string; context: string } {
  const { card, orientation, position } = drawn;
  const meanings = orientation === 'upright' ? card.uprightMeaning : card.reversedMeaning;

  // Determine context based on question
  let context: string = 'general';
  if (question) {
    const q = question.toLowerCase();
    if (q.includes('love') || q.includes('relationship') || q.includes('marriage') || q.includes('partner')) {
      context = 'love';
    } else if (q.includes('career') || q.includes('job') || q.includes('work') || q.includes('promotion')) {
      context = 'career';
    } else if (q.includes('money') || q.includes('finance') || q.includes('wealth') || q.includes('invest')) {
      context = 'finance';
    }
  }

  const contextMeanings = (meanings as any)?.[context] || meanings?.general;
  const generalMeanings = meanings?.general || [];

  const allMeanings = [...new Set([...(contextMeanings || []), ...generalMeanings])];
  const meaning = allMeanings.slice(0, 3).join(', ');

  const positionContext: Record<string, string> = {
    past: 'In the past position, this card represents',
    present: 'In the present position, this card represents',
    future: 'In the future position, this card represents',
    reading: 'For your question, this card represents',
  };

  return {
    meaning,
    context: positionContext[position] || `In the ${position} position, this card represents`,
  };
}
