/**
 * TAROT CARD DATABASE
 * -------------------
 * Complete Major and Minor Arcana cards with meanings.
 * The LLM must only interpret cards that are actually drawn.
 */

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
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

export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana
  {
    id: 'the_fool',
    name: 'The Fool',
    arcana: 'major',
    uprightMeaning: {
      general: ['New beginnings', 'Spontaneity', 'Innocence', 'Free spirit'],
    },
    reversedMeaning: {
      general: ['Recklessness', 'Risk-taking', 'Holding back', 'Foolishness'],
    },
  },
  {
    id: 'the_magician',
    name: 'The Magician',
    arcana: 'major',
    uprightMeaning: {
      general: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired action'],
    },
    reversedMeaning: {
      general: ['Manipulation', 'Poor planning', 'Untapped talents', 'Deception'],
    },
  },
  {
    id: 'the_high_priestess',
    name: 'The High Priestess',
    arcana: 'major',
    uprightMeaning: {
      general: ['Intuition', 'Sacred knowledge', 'Subconscious mind', 'Mystery'],
    },
    reversedMeaning: {
      general: ['Secrets', 'Withdrawal', 'Silence', 'Lack of intuition'],
    },
  },
  {
    id: 'the_empress',
    name: 'The Empress',
    arcana: 'major',
    uprightMeaning: {
      general: ['Abundance', 'Nurturing', 'Fertility', 'Nature'],
    },
    reversedMeaning: {
      general: ['Creative block', 'Dependence', 'Emptiness', 'Lack of growth'],
    },
  },
  {
    id: 'the_emperor',
    name: 'The Emperor',
    arcana: 'major',
    uprightMeaning: {
      general: ['Authority', 'Structure', 'Control', 'Stability'],
    },
    reversedMeaning: {
      general: ['Tyranny', 'Rigidity', 'Over-control', 'Stubbornness'],
    },
  },
  {
    id: 'the_hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    uprightMeaning: {
      general: ['Tradition', 'Spiritual wisdom', 'Education', 'Conformity'],
    },
    reversedMeaning: {
      general: ['Rebellion', 'Innovation', 'Unconventional', 'Personal beliefs'],
    },
  },
  {
    id: 'the_lovers',
    name: 'The Lovers',
    arcana: 'major',
    uprightMeaning: {
      general: ['Love', 'Harmony', 'Relationships', 'Choices'],
    },
    reversedMeaning: {
      general: ['Imbalance', 'Misalignment', 'Disharmony', 'Wrong choice'],
    },
  },
  {
    id: 'the_chariot',
    name: 'The Chariot',
    arcana: 'major',
    uprightMeaning: {
      general: ['Determination', 'Willpower', 'Success', 'Ambition'],
    },
    reversedMeaning: {
      general: ['Lack of control', 'No direction', 'Aggression', 'Defeat'],
    },
  },
  {
    id: 'strength',
    name: 'Strength',
    arcana: 'major',
    uprightMeaning: {
      general: ['Courage', 'Patience', 'Inner strength', 'Compassion'],
    },
    reversedMeaning: {
      general: ['Self-doubt', 'Weakness', 'Insecurity', 'Lack of confidence'],
    },
  },
  {
    id: 'the_hermit',
    name: 'The Hermit',
    arcana: 'major',
    uprightMeaning: {
      general: ['Soul-searching', 'Introspection', 'Solitude', 'Inner guidance'],
    },
    reversedMeaning: {
      general: ['Isolation', 'Loneliness', 'Withdrawal', 'Lost way'],
    },
  },
  {
    id: 'wheel_of_fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    uprightMeaning: {
      general: ['Good luck', 'Karma', 'Life cycles', 'Destiny'],
    },
    reversedMeaning: {
      general: ['Bad luck', 'Resistance to change', 'Breaking cycles', 'External forces'],
    },
  },
  {
    id: 'justice',
    name: 'Justice',
    arcana: 'major',
    uprightMeaning: {
      general: ['Fairness', 'Truth', 'Law', 'Cause and effect'],
    },
    reversedMeaning: {
      general: ['Unfairness', 'Dishonesty', 'Unaccountability', 'Bias'],
    },
  },
  {
    id: 'the_hanged_man',
    name: 'The Hanged Man',
    arcana: 'major',
    uprightMeaning: {
      general: ['Surrender', 'Letting go', 'New perspective', 'Sacrifice'],
    },
    reversedMeaning: {
      general: ['Indecision', 'Stalling', 'Avoidance', 'Delayed action'],
    },
  },
  {
    id: 'death',
    name: 'Death',
    arcana: 'major',
    uprightMeaning: {
      general: ['Transformation', 'Endings', 'Change', 'Rebirth'],
    },
    reversedMeaning: {
      general: ['Resistance to change', 'Stagnation', 'Decay', 'Fear of ending'],
    },
  },
  {
    id: 'temperance',
    name: 'Temperance',
    arcana: 'major',
    uprightMeaning: {
      general: ['Balance', 'Moderation', 'Patience', 'Purpose'],
    },
    reversedMeaning: {
      general: ['Imbalance', 'Excess', 'Self-healing', 'Realignment'],
    },
  },
  {
    id: 'the_devil',
    name: 'The Devil',
    arcana: 'major',
    uprightMeaning: {
      general: ['Shadow self', 'Attachment', 'Addiction', 'Restriction'],
    },
    reversedMeaning: {
      general: ['Releasing limiting beliefs', 'Exploring dark thoughts', 'Detachment', 'Breaking free'],
    },
  },
  {
    id: 'the_tower',
    name: 'The Tower',
    arcana: 'major',
    uprightMeaning: {
      general: ['Sudden change', 'Upheaval', 'Revelation', 'Awakening'],
    },
    reversedMeaning: {
      general: ['Personal transformation', 'Fear of change', 'Avoiding disaster', 'Liberation'],
    },
  },
  {
    id: 'the_star',
    name: 'The Star',
    arcana: 'major',
    uprightMeaning: {
      general: ['Hope', 'Faith', 'Purpose', 'Renewal'],
    },
    reversedMeaning: {
      general: ['Lack of faith', 'Despair', 'Discouragement', 'Insecurity'],
    },
  },
  {
    id: 'the_moon',
    name: 'The Moon',
    arcana: 'major',
    uprightMeaning: {
      general: ['Illusion', 'Fear', 'Anxiety', 'Subconscious'],
    },
    reversedMeaning: {
      general: ['Release of fear', 'Repressed emotion', 'Overcoming confusion', 'Clarity'],
    },
  },
  {
    id: 'the_sun',
    name: 'The Sun',
    arcana: 'major',
    uprightMeaning: {
      general: ['Positivity', 'Fun', 'Warmth', 'Success'],
    },
    reversedMeaning: {
      general: ['Inner child issues', 'Feeling down', 'Overly optimistic', 'Temporary depression'],
    },
  },
  {
    id: 'judgement',
    name: 'Judgement',
    arcana: 'major',
    uprightMeaning: {
      general: ['Judgement', 'Rebirth', 'Inner calling', 'Absolution'],
    },
    reversedMeaning: {
      general: ['Self-doubt', 'Refusing self-examination', 'Ignoring the call', 'Harsh self-judgement'],
    },
  },
  {
    id: 'the_world',
    name: 'The World',
    arcana: 'major',
    uprightMeaning: {
      general: ['Completion', 'Integration', 'Accomplishment', 'Travel'],
    },
    reversedMeaning: {
      general: ['Incompletion', 'Lack of closure', 'Shortcuts', 'Delays'],
    },
  },
  // Minor Arcana - Wands
  {
    id: 'ace_of_wands',
    name: 'Ace of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    uprightMeaning: {
      general: ['Inspiration', 'New opportunities', 'Growth', 'Potential'],
    },
    reversedMeaning: {
      general: ['Delays', 'Lack of direction', 'Distractions', 'Delaying tactics'],
    },
  },
  {
    id: 'two_of_wands',
    name: 'Two of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    uprightMeaning: {
      general: ['Future planning', 'Progress', 'Decisions', 'Discovery'],
    },
    reversedMeaning: {
      general: ['Fear of change', 'Playing it safe', 'Bad planning', 'Unexpected events'],
    },
  },
  {
    id: 'three_of_wands',
    name: 'Three of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    uprightMeaning: {
      general: ['Expansion', 'Foreshaking', 'Opportunity', 'Abundance'],
    },
    reversedMeaning: {
      general: ['Obstacles', 'Delays', 'Frustration', 'Setbacks'],
    },
  },
  {
    id: 'four_of_wands',
    name: 'Four of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    uprightMeaning: {
      general: ['Celebration', 'Harmony', 'Home', 'Community'],
    },
    reversedMeaning: {
      general: ['Personal celebration', 'Inner harmony', 'Conflict with others', 'Transition'],
    },
  },
  {
    id: 'five_of_wands',
    name: 'Five of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    uprightMeaning: {
      general: ['Conflict', 'Disagreements', 'Competition', 'Tension'],
    },
    reversedMeaning: {
      general: ['Resolution of conflict', 'Avoiding battle', 'Agreement', 'Truce'],
    },
  },
  // Minor Arcana - Cups
  {
    id: 'ace_of_cups',
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    uprightMeaning: {
      general: ['Love', 'New feelings', 'Emotional awakening', 'Compassion'],
    },
    reversedMeaning: {
      general: ['Emotional loss', 'Blocked creativity', 'Emptiness', 'Heartbreak'],
    },
  },
  {
    id: 'two_of_cups',
    name: 'Two of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    uprightMeaning: {
      general: ['Unified love', 'Partnership', 'Mutual attraction', 'Connection'],
    },
    reversedMeaning: {
      general: ['Self-love needed', 'Break-up', 'Imbalance', 'Miscommunication'],
    },
  },
  {
    id: 'three_of_cups',
    name: 'Three of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    uprightMeaning: {
      general: ['Celebration', 'Friendship', 'Community', 'Collaboration'],
    },
    reversedMeaning: {
      general: ['Independence', 'Solitude', 'Gossip', 'Overindulgence'],
    },
  },
  {
    id: 'four_of_cups',
    name: 'Four of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    uprightMeaning: {
      general: ['Meditation', 'Contemplation', 'Discontent', 'Boredom'],
    },
    reversedMeaning: {
      general: ['Retreat', 'Withdrawal', 'Checking in with yourself', 'Apathy'],
    },
  },
  {
    id: 'five_of_cups',
    name: 'Five of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    uprightMeaning: {
      general: ['Regret', 'Failure', 'Disappointment', 'Pessimism'],
    },
    reversedMeaning: {
      general: ['Personal setbacks overcome', 'Self-forgiveness', 'Moving on', 'Optimism'],
    },
  },
  // Minor Arcana - Swords
  {
    id: 'ace_of_swords',
    name: 'Ace of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    uprightMeaning: {
      general: ['Breakthrough', 'Clarity', 'Sharp mind', 'Truth'],
    },
    reversedMeaning: {
      general: ['Inner clarity needed', 'Reversal of fortune', 'Confusion', 'Chaos'],
    },
  },
  {
    id: 'two_of_swords',
    name: 'Two of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    uprightMeaning: {
      general: ['Difficult decisions', 'Indecision', 'Compromise', 'Stalemate'],
    },
    reversedMeaning: {
      general: ['Indecision', 'Confusion', 'Information overload', 'Flightiness'],
    },
  },
  {
    id: 'three_of_swords',
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    uprightMeaning: {
      general: ['Heartbreak', 'Emotional pain', 'Grief', 'Sadness'],
    },
    reversedMeaning: {
      general: ['Recovery', 'Forgiveness', 'Releasing pain', 'Optimism'],
    },
  },
  {
    id: 'four_of_swords',
    name: 'Four of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    uprightMeaning: {
      general: ['Rest', 'Relaxation', 'Meditation', 'Recovery'],
    },
    reversedMeaning: {
      general: ['Burn-out', 'Exhaustion', 'Stagnation', 'Need for solitude'],
    },
  },
  {
    id: 'five_of_swords',
    name: 'Five of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    uprightMeaning: {
      general: ['Conflict', 'Disagreement', 'Competition', 'Defeat'],
    },
    reversedMeaning: {
      general: ['Reconciliation', 'Making amends', 'Past resentment', 'Coming to terms'],
    },
  },
  // Minor Arcana - Pentacles
  {
    id: 'ace_of_pentacles',
    name: 'Ace of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    uprightMeaning: {
      general: ['New financial opportunity', 'Prosperity', 'Abundance', 'Security'],
    },
    reversedMeaning: {
      general: ['Lost opportunity', 'Lack of planning', 'Lack of foresight', 'Loose'],
    },
  },
  {
    id: 'two_of_pentacles',
    name: 'Two of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    uprightMeaning: {
      general: ['Multiple priorities', 'Time management', 'Prioritization', 'Flexibility'],
    },
    reversedMeaning: {
      general: ['Over-committed', 'Disorganization', 'Clutter', 'Financial instability'],
    },
  },
  {
    id: 'three_of_pentacles',
    name: 'Three of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    uprightMeaning: {
      general: ['Teamwork', 'Collaboration', 'Learning', 'Implementation'],
    },
    reversedMeaning: {
      general: ['Disharmony', 'Misalignment', 'Working alone', 'Lack of skills'],
    },
  },
  {
    id: 'four_of_pentacles',
    name: 'Four of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    uprightMeaning: {
      general: ['Saving', 'Security', 'Conservation', 'Scarcity mindset'],
    },
    reversedMeaning: {
      general: ['Over-spending', 'Generosity', 'Letting go', 'Greed'],
    },
  },
  {
    id: 'five_of_pentacles',
    name: 'Five of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    uprightMeaning: {
      general: ['Financial loss', 'Poverty', 'Lack mindset', 'Isolation'],
    },
    reversedMeaning: {
      general: ['Recovery from loss', 'Spiritual poverty overcome', 'Support received', 'Hope'],
    },
  },
  // ── Wands 6-10 ──
  {
    id: 'six_of_wands',
    name: 'Six of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    uprightMeaning: {
      love: ['Public relationship', 'Pride in partner', 'Social recognition as a couple'],
      career: ['Victory', 'Recognition', 'Public success', 'Award'],
      finance: ['Financial victory', 'Winning', 'Success in competition'],
      general: ['Success', 'Victory', 'Public recognition', 'Confidence'],
    },
    reversedMeaning: {
      love: ['Private relationship', 'Ego clashes', 'Lack of recognition'],
      career: ['Defeat', 'Lack of recognition', 'Mediocrity'],
      finance: ['Financial defeat', 'Loss in competition'],
      general: ['Defeat', 'Lack of recognition', 'Humiliation', 'Ego deflated'],
    },
  },
  {
    id: 'seven_of_wands',
    name: 'Seven of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    uprightMeaning: {
      love: ['Fighting for love', 'Standing up for relationship', 'Competition for affection'],
      career: ['Competition', 'Defending position', 'Standing your ground'],
      finance: ['Competitive market', 'Defending assets', 'Holding ground financially'],
      general: ['Challenge', 'Competition', 'Perseverance', 'Defense'],
    },
    reversedMeaning: {
      love: ['Giving up', 'Surrender', 'Exhaustion in relationship'],
      career: ['Giving up', 'Overwhelmed', 'Losing ground'],
      finance: ['Financial surrender', 'Losing market position'],
      general: ['Giving up', 'Exhaustion', 'Overwhelmed', 'Retreat'],
    },
  },
  {
    id: 'eight_of_wands',
    name: 'Eight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    uprightMeaning: {
      love: ['Swift romance', 'Passionate affair', 'Quick connection', 'Travel for love'],
      career: ['Rapid progress', 'Fast-moving projects', 'Deadline approaching'],
      finance: ['Quick financial gains', 'Fast transactions', 'Market movement'],
      general: ['Speed', 'Movement', 'Alignment', 'Swift action'],
    },
    reversedMeaning: {
      love: ['Delays in love', 'Waiting', 'Slow progress in romance'],
      career: ['Delays', 'Slowdown', 'Waiting for results'],
      finance: ['Financial delays', 'Slow market', 'Pending transactions'],
      general: ['Delays', 'Slowness', 'Waiting', 'Frustration'],
    },
  },
  {
    id: 'nine_of_wands',
    name: 'Nine of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    uprightMeaning: {
      love: ['Resilience in love', 'Fighting for relationship', 'Boundaries in love'],
      career: ['Persistence', 'Last push', 'Grit', 'Near success'],
      finance: ['Financial resilience', 'Holding on', 'Last resource'],
      general: ['Resilience', 'Persistence', 'Grit', 'Last stand'],
    },
    reversedMeaning: {
      love: ['Exhaustion', 'Giving up', 'Emotional fatigue'],
      career: ['Burnout', 'Giving up', 'Defeat'],
      finance: ['Financial exhaustion', 'Running out'],
      general: ['Exhaustion', 'Defeat', 'Burnout', 'Giving up'],
    },
  },
  {
    id: 'ten_of_wands',
    name: 'Ten of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    uprightMeaning: {
      love: ['Heavy responsibility', 'Burden in relationship', 'Over-commitment'],
      career: ['Heavy workload', 'Burnout', 'Taking on too much', 'Hard work'],
      finance: ['Financial burden', 'Debt', 'Over-extension'],
      general: ['Burden', 'Responsibility', 'Hard work', 'Stress'],
    },
    reversedMeaning: {
      love: ['Release from burden', 'Letting go', 'Simplifying relationship'],
      career: ['Delegation', 'Releasing burden', 'Work-life balance'],
      finance: ['Financial relief', 'Debt reduction', 'Simplifying finances'],
      general: ['Release', 'Relief', 'Letting go', 'Simplifying'],
    },
  },
  // ── Cups 6-10 ──
  {
    id: 'six_of_cups',
    name: 'Six of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    uprightMeaning: {
      love: ['Reunion', 'Old flame', 'Childhood sweetheart', 'Nostalgia in love'],
      career: ['Revisiting old projects', 'Nostalgia', 'Return to past work'],
      finance: ['Past financial patterns', 'Inheritance', 'Gift from family'],
      general: ['Nostalgia', 'Innocence', 'Reunion', 'Past memories'],
    },
    reversedMeaning: {
      love: ['Living in past', 'Nostalgia blocking growth', 'Old patterns repeating'],
      career: ['Stuck in past', 'Not moving forward', 'Old methods'],
      finance: ['Financial immaturity', 'Living beyond means'],
      general: ['Living in past', 'Stagnation', 'Naivety', 'Imaturity'],
    },
  },
  {
    id: 'seven_of_cups',
    name: 'Seven of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    uprightMeaning: {
      love: ['Fantasy', 'Illusion', 'Too many options', 'Daydreaming about love'],
      career: ['Many choices', 'Fantasy vs reality', 'Lack of focus'],
      finance: ['Financial fantasies', 'Unrealistic expectations', 'Too many options'],
      general: ['Fantasy', 'Illusion', 'Choices', 'Daydreaming'],
    },
    reversedMeaning: {
      love: ['Clarity in love', 'Choosing wisely', 'Reality check'],
      career: ['Clarity', 'Focused choice', 'Action over fantasy'],
      finance: ['Financial clarity', 'Realistic planning'],
      general: ['Clarity', 'Focus', 'Decision', 'Reality check'],
    },
  },
  {
    id: 'eight_of_cups',
    name: 'Eight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    uprightMeaning: {
      love: ['Walking away', 'Disappointment', 'Seeking deeper love', 'Emotional departure'],
      career: ['Leaving job', 'Seeking meaning', 'Career change', 'Disillusionment'],
      finance: ['Walking away from money', 'Seeking purpose over profit'],
      general: ['Walking away', 'Disappointment', 'Seeking meaning', 'Departure'],
    },
    reversedMeaning: {
      love: ['Fear of leaving', 'Staying in comfort zone', 'Avoidance'],
      career: ['Stuck in job', 'Fear of change', 'Complacency'],
      finance: ['Staying in comfort zone', 'Fear of financial change'],
      general: ['Stagnation', 'Fear of change', 'Avoidance', 'Stuck'],
    },
  },
  {
    id: 'nine_of_cups',
    name: 'Nine of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    uprightMeaning: {
      love: ['Wish fulfilled', 'Emotional satisfaction', 'Contentment in love'],
      career: ['Job satisfaction', 'Dream career', 'Wishes coming true'],
      finance: ['Financial wish fulfilled', 'Comfort', 'Satisfaction'],
      general: ['Wish granted', 'Contentment', 'Satisfaction', 'Happiness'],
    },
    reversedMeaning: {
      love: ['Unfulfilled wishes', 'Disappointment', 'Materialism in love'],
      career: ['Unfulfilled career', 'Disappointment', 'Vanity'],
      finance: ['Financial disappointment', 'Unmet expectations'],
      general: ['Unfulfilled wishes', 'Discontent', 'Vanity', 'Greed'],
    },
  },
  {
    id: 'ten_of_cups',
    name: 'Ten of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    uprightMeaning: {
      love: ['Happy family', 'Harmonious relationship', 'Emotional fulfillment', 'Marriage'],
      career: ['Dream job', 'Fulfilling work', 'Work-life harmony'],
      finance: ['Financial harmony', 'Prosperous family', 'Abundance'],
      general: ['Happiness', 'Harmony', 'Family', 'Emotional fulfillment'],
    },
    reversedMeaning: {
      love: ['Broken family', 'Disharmony', 'Disconnection', 'Failed relationship'],
      career: ['Work-family imbalance', 'Unfulfilling career'],
      finance: ['Family financial disputes', 'Disharmony over money'],
      general: ['Broken family', 'Disharmony', 'Disconnection', 'Loss'],
    },
  },
  // ── Swords 6-10 ──
  {
    id: 'six_of_swords',
    name: 'Six of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    uprightMeaning: {
      love: ['Moving on', 'Recovery', 'Leaving toxic relationship', 'Healing journey'],
      career: ['Career transition', 'Moving to better position', 'Relocation'],
      finance: ['Financial recovery', 'Moving to better finances'],
      general: ['Transition', 'Moving on', 'Recovery', 'Journey'],
    },
    reversedMeaning: {
      love: ['Stuck in past', 'Unable to move on', 'Resistance to change'],
      career: ['Stuck in current job', 'Resistance to change'],
      finance: ['Financial stagnation', 'Unable to improve'],
      general: ['Stagnation', 'Resistance', 'Unable to move on'],
    },
  },
  {
    id: 'seven_of_swords',
    name: 'Seven of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    uprightMeaning: {
      love: ['Deception', 'Cheating', 'Avoidance', 'Strategy'],
      career: ['Strategic planning', 'Tactics', 'Avoidance', 'Cleverness'],
      finance: ['Financial strategy', 'Tax planning', 'Avoiding debt'],
      general: ['Strategy', 'Deception', 'Cleverness', 'Avoidance'],
    },
    reversedMeaning: {
      love: ['Coming clean', 'Truth revealed', 'Accountability'],
      career: ['Exposure', 'Honesty', 'Coming clean'],
      finance: ['Financial honesty', 'Transparency'],
      general: ['Truth revealed', 'Accountability', 'Confession'],
    },
  },
  {
    id: 'eight_of_swords',
    name: 'Eight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    uprightMeaning: {
      love: ['Feeling trapped', 'Restriction', 'Powerlessness', 'Self-imposed limits'],
      career: ['Feeling stuck', 'Restriction', 'Lack of options'],
      finance: ['Financial restriction', 'Feeling trapped by debt'],
      general: ['Restriction', 'Entrapment', 'Powerlessness', 'Victim mentality'],
    },
    reversedMeaning: {
      love: ['Liberation', 'Breaking free', 'New perspective'],
      career: ['Freedom', 'New options', 'Breaking free'],
      finance: ['Financial liberation', 'Breaking free from debt'],
      general: ['Liberation', 'Freedom', 'New perspective', 'Release'],
    },
  },
  {
    id: 'nine_of_swords',
    name: 'Nine of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    uprightMeaning: {
      love: ['Anxiety', 'Worry', 'Insomnia', 'Fear about relationship'],
      career: ['Work anxiety', 'Stress', 'Worry about career'],
      finance: ['Financial anxiety', 'Debt worries', 'Sleepless nights'],
      general: ['Anxiety', 'Worry', 'Insomnia', 'Fear', 'Nightmares'],
    },
    reversedMeaning: {
      love: ['Overcoming anxiety', 'Hope', 'Recovery'],
      career: ['Recovery from stress', 'Hope', 'Relief'],
      finance: ['Financial relief', 'Overcoming debt anxiety'],
      general: ['Overcoming anxiety', 'Hope', 'Recovery', 'Relief'],
    },
  },
  {
    id: 'ten_of_swords',
    name: 'Ten of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    uprightMeaning: {
      love: ['Betrayal', 'Ending', 'Painful conclusion', 'Rock bottom'],
      career: ['Career ending', 'Failure', 'Rock bottom', 'Closure'],
      finance: ['Financial ruin', 'Complete loss', 'Rock bottom'],
      general: ['Ending', 'Betrayal', 'Rock bottom', 'Painful conclusion'],
    },
    reversedMeaning: {
      love: ['Recovery from betrayal', 'New beginning', 'Resilience'],
      career: ['Recovery', 'New beginning', 'Resilience'],
      finance: ['Financial recovery', 'Rebuilding', 'New start'],
      general: ['Recovery', 'New beginning', 'Resilience', 'Survival'],
    },
  },
  // ── Pentacles 6-10 ──
  {
    id: 'six_of_pentacles',
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    uprightMeaning: {
      love: ['Generosity', 'Sharing', 'Balanced give-and-take'],
      career: ['Mentorship', 'Sharing knowledge', 'Fair treatment'],
      finance: ['Charity', 'Generosity', 'Sharing wealth', 'Fair exchange'],
      general: ['Generosity', 'Sharing', 'Charity', 'Balance'],
    },
    reversedMeaning: {
      love: ['Selfishness', 'Imbalance', 'One-sided giving'],
      career: ['Exploitation', 'Unfair treatment', 'Taking advantage'],
      finance: ['Debt', 'Unfair exchange', 'Greed'],
      general: ['Selfishness', 'Greed', 'Imbalance', 'Unfairness'],
    },
  },
  {
    id: 'seven_of_pentacles',
    name: 'Seven of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    uprightMeaning: {
      love: ['Patience', 'Long-term investment', 'Waiting for love'],
      career: ['Investment', 'Long-term results', 'Patience', 'Growth'],
      finance: ['Investment', 'Patient growth', 'Long-term planning'],
      general: ['Patience', 'Investment', 'Growth', 'Long-term'],
    },
    reversedMeaning: {
      love: ['Impatience', 'Lack of growth', 'Frustration'],
      career: ['Lack of results', 'Frustration', 'Impatience'],
      finance: ['Poor investment', 'Lack of growth', 'Frustration'],
      general: ['Impatience', 'Frustration', 'Lack of growth', 'Stagnation'],
    },
  },
  {
    id: 'eight_of_pentacles',
    name: 'Eight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    uprightMeaning: {
      love: ['Dedication', 'Effort', 'Building relationship', 'Craftsmanship in love'],
      career: ['Hard work', 'Mastery', 'Dedication', 'Skill development'],
      finance: ['Financial diligence', 'Craftsmanship', 'Building wealth'],
      general: ['Dedication', 'Hard work', 'Mastery', 'Craftsmanship'],
    },
    reversedMeaning: {
      love: ['Lack of effort', 'Boredom', 'Complacency'],
      career: ['Poor quality', 'Lack of dedication', 'Cutting corners'],
      finance: ['Financial laziness', 'Poor craftsmanship'],
      general: ['Laziness', 'Complacency', 'Poor quality', 'Lack of effort'],
    },
  },
  {
    id: 'nine_of_pentacles',
    name: 'Nine of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    uprightMeaning: {
      love: ['Self-sufficiency', 'Independence', 'Luxury in love'],
      career: ['Financial independence', 'Success', 'Luxury', 'Self-made'],
      finance: ['Financial independence', 'Luxury', 'Comfort', 'Self-sufficiency'],
      general: ['Independence', 'Luxury', 'Self-sufficiency', 'Success'],
    },
    reversedMeaning: {
      love: ['Dependence', 'Self-worth issues', 'Over-spending'],
      career: ['Financial dependence', 'Overspending', 'Loss of independence'],
      finance: ['Financial dependence', 'Over-spending', 'Loss'],
      general: ['Dependence', 'Overspending', 'Loss of independence'],
    },
  },
  {
    id: 'ten_of_pentacles',
    name: 'Ten of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    uprightMeaning: {
      love: ['Long-term commitment', 'Family legacy', 'Generational wealth'],
      career: ['Long-term success', 'Legacy', 'Generational wealth'],
      finance: ['Wealth', 'Legacy', 'Generational wealth', 'Financial security'],
      general: ['Wealth', 'Legacy', 'Family', 'Financial security'],
    },
    reversedMeaning: {
      love: ['Family disputes', 'Loss of legacy', 'Broken family'],
      career: ['Loss of legacy', 'Family business issues'],
      finance: ['Financial loss', 'Lost inheritance', 'Family disputes over money'],
      general: ['Loss of wealth', 'Family disputes', 'Broken legacy'],
    },
  },
  // ── Court Cards ──
  // Wands Court
  {
    id: 'page_of_wands',
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    uprightMeaning: {
      love: ['New romantic energy', 'Adventure in love', 'Playful attraction'],
      career: ['New opportunity', 'Enthusiasm', 'Learning', 'Creative energy'],
      finance: ['New financial venture', 'Exciting opportunity'],
      general: ['Enthusiasm', 'Adventure', 'New energy', 'Exploration'],
    },
    reversedMeaning: {
      love: ['Immature love', 'Fickleness', 'Lack of direction'],
      career: ['Lack of direction', 'Immaturity', 'Procrastination'],
      finance: ['Financial immaturity', 'Risky ventures'],
      general: ['Immaturity', 'Lack of direction', 'Procrastination'],
    },
  },
  {
    id: 'knight_of_wands',
    name: 'Knight of Wands',
    arcana: 'minor',
    suit: 'wands',
    uprightMeaning: {
      love: ['Passionate pursuit', 'Adventure', 'Bold move', 'Romance'],
      career: ['Action', 'Energy', 'Adventure', 'Taking initiative'],
      finance: ['Bold financial move', 'Risk-taking', 'Action'],
      general: ['Action', 'Adventure', 'Energy', 'Boldness'],
    },
    reversedMeaning: {
      love: ['Reckless pursuit', 'Impulsive', 'Lack of direction'],
      career: ['Haste', 'Reckless action', 'Burnout'],
      finance: ['Financial recklessness', 'Impulsive spending'],
      general: ['Haste', 'Recklessness', 'Impulsiveness', 'Burnout'],
    },
  },
  {
    id: 'queen_of_wands',
    name: 'Queen of Wands',
    arcana: 'minor',
    suit: 'wands',
    uprightMeaning: {
      love: ['Confident woman', 'Passionate', 'Independent', 'Warm'],
      career: ['Leadership', 'Confidence', 'Courage', 'Entrepreneurship'],
      finance: ['Financial confidence', 'Bold decisions', 'Independence'],
      general: ['Confidence', 'Courage', 'Warmth', 'Independence'],
    },
    reversedMeaning: {
      love: ['Jealousy', 'Selfishness', 'Insecurity'],
      career: ['Insecurity', 'Selfishness', 'Dictatorial'],
      finance: ['Financial insecurity', 'Selfishness'],
      general: ['Jealousy', 'Insecurity', 'Selfishness', 'Attention-seeking'],
    },
  },
  {
    id: 'king_of_wands',
    name: 'King of Wands',
    arcana: 'minor',
    suit: 'wands',
    uprightMeaning: {
      love: ['Leadership in love', 'Bold partner', 'Visionary', 'Inspiring'],
      career: ['Visionary leader', 'Bold decisions', 'Inspiration', 'Honor'],
      finance: ['Bold financial leadership', 'Visionary investments'],
      general: ['Leadership', 'Vision', 'Boldness', 'Honor'],
    },
    reversedMeaning: {
      love: ['Domineering', 'Selfish', 'Impulsive'],
      career: ['Dictatorial', 'Impulsive', 'Burnout'],
      finance: ['Financial impulsiveness', 'Reckless leadership'],
      general: ['Domineering', 'Impulsive', 'Reckless', 'Selfish'],
    },
  },
  // Cups Court
  {
    id: 'page_of_cups',
    name: 'Page of Cups',
    arcana: 'minor',
    suit: 'cups',
    uprightMeaning: {
      love: ['New romance', 'Creative love', 'Intuitive connection', 'Sweet message'],
      career: ['Creative opportunity', 'Intuition', 'New idea', 'Inspiration'],
      finance: ['Creative venture', 'Unexpected money'],
      general: ['Creativity', 'Intuition', 'New opportunity', 'Emotional openness'],
    },
    reversedMeaning: {
      love: ['Emotional immaturity', 'Unrealistic expectations'],
      career: ['Lack of creativity', 'Emotional blocks'],
      finance: ['Financial immaturity', 'Unrealistic expectations'],
      general: ['Emotional immaturity', 'Unrealistic', 'Lack of creativity'],
    },
  },
  {
    id: 'knight_of_cups',
    name: 'Knight of Cups',
    arcana: 'minor',
    suit: 'cups',
    uprightMeaning: {
      love: ['Romantic offer', 'Charm', 'Proposal', 'Following the heart'],
      career: ['Creative proposal', 'Follow your heart', 'Artistic venture'],
      finance: ['Financial offer', 'Creative investment'],
      general: ['Romance', 'Charm', 'Follow your heart', 'Proposal'],
    },
    reversedMeaning: {
      love: ['Unrealistic romance', 'Moodiness', 'Disappointment'],
      career: ['Unrealistic creative pursuit', 'Moodiness'],
      finance: ['Financial disappointment', 'Unrealistic offer'],
      general: ['Moodiness', 'Unrealistic', 'Disappointment', 'Imagination vs reality'],
    },
  },
  {
    id: 'queen_of_cups',
    name: 'Queen of Cups',
    arcana: 'minor',
    suit: 'cups',
    uprightMeaning: {
      love: ['Compassionate woman', 'Emotional depth', 'Nurturing', 'Intuitive'],
      career: ['Compassionate leadership', 'Emotional intelligence', 'Nurturing'],
      finance: ['Compassionate use of resources', 'Emotional spending'],
      general: ['Compassion', 'Emotional depth', 'Nurturing', 'Intuition'],
    },
    reversedMeaning: {
      love: ['Emotional manipulation', 'Dependency', 'Selflessness to fault'],
      career: ['Emotional overwhelm', 'Codependency'],
      finance: ['Emotional spending', 'Generosity to fault'],
      general: ['Emotional manipulation', 'Dependency', 'Selflessness to fault'],
    },
  },
  {
    id: 'king_of_cups',
    name: 'King of Cups',
    arcana: 'minor',
    suit: 'cups',
    uprightMeaning: {
      love: ['Emotionally mature partner', 'Balance', 'Compassion', 'Wisdom'],
      career: ['Emotional leadership', 'Diplomacy', 'Calm under pressure'],
      finance: ['Balanced financial decisions', 'Emotional intelligence'],
      general: ['Emotional mastery', 'Diplomacy', 'Compassion', 'Wisdom'],
    },
    reversedMeaning: {
      love: ['Emotional manipulation', 'Moodiness', 'Suppressed emotions'],
      career: ['Emotional manipulation', 'Moodiness', 'Untrustworthy'],
      finance: ['Emotional financial decisions', 'Manipulation'],
      general: ['Emotional manipulation', 'Moodiness', 'Suppression', 'Untrustworthy'],
    },
  },
  // Swords Court
  {
    id: 'page_of_swords',
    name: 'Page of Swords',
    arcana: 'minor',
    suit: 'swords',
    uprightMeaning: {
      love: ['Curiosity', 'New communication', 'Mental connection', 'Truth'],
      career: ['New idea', 'Curiosity', 'Communication', 'Truth-seeking'],
      finance: ['New financial insight', 'Research', 'Curiosity'],
      general: ['Curiosity', 'New ideas', 'Communication', 'Truth'],
    },
    reversedMeaning: {
      love: ['Gossip', 'Miscommunication', 'Petty arguments'],
      career: ['Gossip', 'Lack of clarity', 'Petty conflicts'],
      finance: ['Financial gossip', 'Misinformation'],
      general: ['Gossip', 'Miscommunication', 'Petty conflicts'],
    },
  },
  {
    id: 'knight_of_swords',
    name: 'Knight of Swords',
    arcana: 'minor',
    suit: 'swords',
    uprightMeaning: {
      love: ['Direct communication', 'Bold truth', 'Intellectual pursuit'],
      career: ['Ambition', 'Speed', 'Intellectual pursuit', 'Directness'],
      finance: ['Aggressive financial moves', 'Speed'],
      general: ['Ambition', 'Speed', 'Intellectual pursuit', 'Directness'],
    },
    reversedMeaning: {
      love: ['Impulsive words', 'Thoughtless', 'Hasty'],
      career: ['Impulsive action', 'Recklessness', 'Burnout'],
      finance: ['Financial impulsiveness', 'Hasty decisions'],
      general: ['Impulsive', 'Reckless', 'Thoughtless', 'Burnout'],
    },
  },
  {
    id: 'queen_of_swords',
    name: 'Queen of Swords',
    arcana: 'minor',
    suit: 'swords',
    uprightMeaning: {
      love: ['Independent woman', 'Clear boundaries', 'Honest', 'Intellectual'],
      career: ['Clear thinking', 'Independence', 'Fairness', 'Truth'],
      finance: ['Independent financial decisions', 'Clear boundaries'],
      general: ['Independence', 'Clear thinking', 'Truth', 'Fairness'],
    },
    reversedMeaning: {
      love: ['Cruelty', 'Bitterness', 'Coldness'],
      career: ['Cruelty', 'Coldness', 'Malice'],
      finance: ['Financial cruelty', 'Coldness'],
      general: ['Cruelty', 'Bitterness', 'Coldness', 'Malice'],
    },
  },
  {
    id: 'king_of_swords',
    name: 'King of Swords',
    arcana: 'minor',
    suit: 'swords',
    uprightMeaning: {
      love: ['Intellectual partner', 'Clear communication', 'Truth', 'Fairness'],
      career: ['Intellectual authority', 'Clear thinking', 'Fairness', 'Truth'],
      finance: ['Financial authority', 'Clear decisions', 'Fairness'],
      general: ['Intellectual authority', 'Clear thinking', 'Truth', 'Fairness'],
    },
    reversedMeaning: {
      love: ['Manipulation', 'Coldness', 'Cruelty'],
      career: ['Manipulation', 'Cruelty', 'Abuse of power'],
      finance: ['Financial manipulation', 'Abuse of power'],
      general: ['Manipulation', 'Cruelty', 'Abuse of power', 'Coldness'],
    },
  },
  // Pentacles Court
  {
    id: 'page_of_pentacles',
    name: 'Page of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    uprightMeaning: {
      love: ['New beginning', 'Stability', 'Practical love', 'Groundedness'],
      career: ['New opportunity', 'Study', 'Learning', 'Practical skills'],
      finance: ['New financial opportunity', 'Savings', 'Practical approach'],
      general: ['New beginning', 'Stability', 'Practicality', 'Learning'],
    },
    reversedMeaning: {
      love: ['Lack of progress', 'Laziness', 'Stagnation'],
      career: ['Lack of progress', 'Laziness', 'Missed opportunity'],
      finance: ['Financial stagnation', 'Laziness', 'Missed opportunity'],
      general: ['Stagnation', 'Laziness', 'Missed opportunity', 'Lack of progress'],
    },
  },
  {
    id: 'knight_of_pentacles',
    name: 'Knight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    uprightMeaning: {
      love: ['Reliable partner', 'Slow and steady', 'Dependable', 'Loyal'],
      career: ['Hard work', 'Reliability', 'Steady progress', 'Dependability'],
      finance: ['Steady financial growth', 'Reliable investments'],
      general: ['Reliability', 'Hard work', 'Patience', 'Steady progress'],
    },
    reversedMeaning: {
      love: ['Stubbornness', 'Boredom', 'Laziness'],
      career: ['Stagnation', 'Boredom', 'Lack of initiative'],
      finance: ['Financial stagnation', 'Boredom', 'Lack of initiative'],
      general: ['Stubbornness', 'Laziness', 'Boredom', 'Stagnation'],
    },
  },
  {
    id: 'queen_of_pentacles',
    name: 'Queen of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    uprightMeaning: {
      love: ['Nurturing partner', 'Practical love', 'Comfort', 'Security'],
      career: ['Nurturing leadership', 'Practical management', 'Comfort'],
      finance: ['Financial nurturing', 'Practical abundance', 'Security'],
      general: ['Nurturing', 'Practicality', 'Comfort', 'Abundance'],
    },
    reversedMeaning: {
      love: ['Over-nurturing', 'Self-neglect', 'Financial dependence'],
      career: ['Over-nurturing', 'Self-neglect', 'Financial issues'],
      finance: ['Financial self-neglect', 'Over-spending on others'],
      general: ['Over-nurturing', 'Self-neglect', 'Financial issues'],
    },
  },
  {
    id: 'king_of_pentacles',
    name: 'King of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    uprightMeaning: {
      love: ['Wealthy partner', 'Stability', 'Security', 'Generosity'],
      career: ['Business success', 'Wealth', 'Leadership', 'Prosperity'],
      finance: ['Wealth', 'Prosperity', 'Financial mastery', 'Business acumen'],
      general: ['Wealth', 'Prosperity', 'Security', 'Business success'],
    },
    reversedMeaning: {
      love: ['Greed', 'Materialism', 'Overly focused on money'],
      career: ['Greed', 'Materialism', 'Corruption'],
      finance: ['Greed', 'Materialism', 'Corruption', 'Financial loss'],
      general: ['Greed', 'Materialism', 'Corruption', 'Loss'],
    },
  },
];

export function getTarotCardById(id: string): TarotCard | undefined {
  return TAROT_CARDS.find((c) => c.id === id);
}

export function getTarotCardByName(name: string): TarotCard | undefined {
  return TAROT_CARDS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
