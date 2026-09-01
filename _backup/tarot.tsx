import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { uiStrings } from '@/constants/ui-strings';

const ACCENT = '#B09C66';
const GOLD = '#C9BE98';
const BG = require('@/assets/images/background.png');
const TAROT_ICON = require('@/assets/images/quick-action/tarot.png');

type TarotCard = { name: string; meaning: string; image: any };
type ReadingHistory = { date: string; cards: { name: string; meaning: string }[]; spread: string };
const HISTORY_KEY = 'tarot-history';
const t = uiStrings('en').t;

const IMAGES: Record<string, any> = {
  'Ace_of_Wands_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Ace_of_Wands_tarot_card_202608162246.jpeg'),
  'Blindfolded_woman_holding_crosse__202608162246.jpeg': require('@/assets/images/tarot-cards/Blindfolded_woman_holding_crosse__202608162246.jpeg'),
  'Blindfolded_woman_standing_with___202608162246.jpeg': require('@/assets/images/tarot-cards/Blindfolded_woman_standing_with___202608162246.jpeg'),
  'Dark-robed_figure_holding_golden__202608162246.jpeg': require('@/assets/images/tarot-cards/Dark-robed_figure_holding_golden__202608162246.jpeg'),
  'Eight_of_Wands_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Eight_of_Wands_tarot_card_202608162246.jpeg'),
  'Emperor_seated_on_throne_202608162246.jpeg': require('@/assets/images/tarot-cards/Emperor_seated_on_throne_202608162246.jpeg'),
  'Female_figure_holding_sword_and_202608162246.jpeg': require('@/assets/images/tarot-cards/Female_figure_holding_sword_and_202608162246.jpeg'),
  'Figure_contemplating_beneath_anc__202608162246.jpeg': require('@/assets/images/tarot-cards/Figure_contemplating_beneath_anc__202608162246.jpeg'),
  'Figure_sitting_with_nine_swords_202608162246.jpeg': require('@/assets/images/tarot-cards/Figure_sitting_with_nine_swords_202608162246.jpeg'),
  'Figure_standing_by_river_tarot_202608162246.jpeg': require('@/assets/images/tarot-cards/Figure_standing_by_river_tarot_202608162246.jpeg'),
  'Figure_viewing_seven_mystical_cups_202608162246.jpeg': require('@/assets/images/tarot-cards/Figure_viewing_seven_mystical_cups_202608162246.jpeg'),
  'Five_of_Wands_Tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Five_of_Wands_Tarot_card_202608162246.jpeg'),
  'Four_of_Swords_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Four_of_Swords_tarot_card_202608162246.jpeg'),
  'Four_of_Wands_Tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Four_of_Wands_Tarot_card_202608162246.jpeg'),
  'Gardener_observing_tree_with_pen__202608162246.jpeg': require('@/assets/images/tarot-cards/Gardener_observing_tree_with_pen__202608162246.jpeg'),
  'Gargoyle_tarot_card_design_202608162246.jpeg': require('@/assets/images/tarot-cards/Gargoyle_tarot_card_design_202608162246.jpeg'),
  'Gothic_artisans_working_Three_of__202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_artisans_working_Three_of__202608162246.jpeg'),
  'Gothic_craftsman_engraving_golde__202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_craftsman_engraving_golde__202608162246.jpeg'),
  'Gothic_figure_balancing_two_pent__202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_figure_balancing_two_pent__202608162246.jpeg'),
  'Gothic_heart_pierced_by_swords_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_heart_pierced_by_swords_202608162246.jpeg'),
  'Gothic_king_holding_sword_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_king_holding_sword_202608162246.jpeg'),
  'Gothic_knight_charging_with_sword_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_knight_charging_with_sword_202608162246.jpeg'),
  'Gothic_knight_holding_golden_pen__202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_knight_holding_golden_pen__202608162246.jpeg'),
  'Gothic_Queen_holding_glowing_wand_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_Queen_holding_glowing_wand_202608162246.jpeg'),
  'Gothic_queen_holding_sword_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_queen_holding_sword_202608162246.jpeg'),
  'Gothic_tarot_card_Judgement_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_tarot_card_Judgement_202608162246.jpeg'),
  'Gothic_tarot_card_Ten_of_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_tarot_card_Ten_of_202608162246.jpeg'),
  'Gothic_warrior_holding_sword_202608162246.jpeg': require('@/assets/images/tarot-cards/Gothic_warrior_holding_sword_202608162246.jpeg'),
  'Hand_holding_sword_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Hand_holding_sword_tarot_card_202608162246.jpeg'),
  'Hand_presenting_glowing_golden_p__202608162246.jpeg': require('@/assets/images/tarot-cards/Hand_presenting_glowing_golden_p__202608162246.jpeg'),
  'King_of_Cups_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/King_of_Cups_tarot_card_202608162246.jpeg'),
  'King_of_Pentacles_Tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/King_of_Pentacles_Tarot_card_202608162246.jpeg'),
  'King_of_Wands_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/King_of_Wands_tarot_card_202608162246.jpeg'),
  'Knight_of_Cups_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Knight_of_Cups_tarot_card_202608162246.jpeg'),
  'Knight_of_Wands_Tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Knight_of_Wands_Tarot_card_202608162246.jpeg'),
  'Magician_tarot_card_with_altar_202608162246.jpeg': require('@/assets/images/tarot-cards/Magician_tarot_card_with_altar_202608162246.jpeg'),
  'Mystical_figure_seated_with_cups_202608162246.jpeg': require('@/assets/images/tarot-cards/Mystical_figure_seated_with_cups_202608162246.jpeg'),
  'Mystical_woman_pouring_water_202608162246.jpeg': require('@/assets/images/tarot-cards/Mystical_woman_pouring_water_202608162246.jpeg'),
  'Page_of_Cups_Tarot_Card_202608162246.jpeg': require('@/assets/images/tarot-cards/Page_of_Cups_Tarot_Card_202608162246.jpeg'),
  'Page_of_Wands_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Page_of_Wands_tarot_card_202608162246.jpeg'),
  'Queen_of_Cups_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Queen_of_Cups_tarot_card_202608162246.jpeg'),
  'Queen_of_Pentacles_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Queen_of_Pentacles_tarot_card_202608162246.jpeg'),
  'Scholar_studying_glowing_golden___202608162246.jpeg': require('@/assets/images/tarot-cards/Scholar_studying_glowing_golden___202608162246.jpeg'),
  'Seven_of_Swords_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Seven_of_Swords_tarot_card_202608162246.jpeg'),
  'Six_of_Pentacles_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Six_of_Pentacles_tarot_card_202608162246.jpeg'),
  'Skeletal_rider_on_pale_horse_202608162246.jpeg': require('@/assets/images/tarot-cards/Skeletal_rider_on_pale_horse_202608162246.jpeg'),
  'Tarot_card_depicting_Ace_of_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_depicting_Ace_of_202608162246.jpeg'),
  'Tarot_card_depicting_six_cups_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_depicting_six_cups_202608162246.jpeg'),
  'Tarot_card_depicting_The_Hierophant_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_depicting_The_Hierophant_202608162246.jpeg'),
  'Tarot_card_depicting_The_Moon_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_depicting_The_Moon_202608162246.jpeg'),
  'Tarot_card_depicting_The_Sun_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_depicting_The_Sun_202608162246.jpeg'),
  'Tarot_card_showing_traveler_cros__202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_showing_traveler_cros__202608162246.jpeg'),
  'Tarot_card_Ten_of_Swords_202608162246.jpeg': require('@/assets/images/tarot-cards/Tarot_card_Ten_of_Swords_202608162246.jpeg'),
  'Temperance_tarot_card_design_202608162246.jpeg': require('@/assets/images/tarot-cards/Temperance_tarot_card_design_202608162246.jpeg'),
  'Ten_of_Cups_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Ten_of_Cups_tarot_card_202608162246.jpeg'),
  'The_Empress_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Empress_tarot_card_202608162246.jpeg'),
  'The_Fool_tarot_card_artwork_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Fool_tarot_card_artwork_202608162246.jpeg'),
  'The_Hanged_Man_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Hanged_Man_tarot_card_202608162246.jpeg'),
  'The_Hermit_tarot_card_art_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Hermit_tarot_card_art_202608162246.jpeg'),
  'The_High_Priestess_Tarot_Card_202608162246.jpeg': require('@/assets/images/tarot-cards/The_High_Priestess_Tarot_Card_202608162246.jpeg'),
  'The_Lovers_Tarot_card_artwork_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Lovers_Tarot_card_artwork_202608162246.jpeg'),
  'The_Tower_tarot_card_struck_202608162246.jpeg': require('@/assets/images/tarot-cards/The_Tower_tarot_card_struck_202608162246.jpeg'),
  'The_World_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/The_World_tarot_card_202608162246.jpeg'),
  'Three_of_Cups_Tarot_Card_202608162246.jpeg': require('@/assets/images/tarot-cards/Three_of_Cups_Tarot_Card_202608162246.jpeg'),
  'Traveler_carrying_wands_toward_c__202608162246.jpeg': require('@/assets/images/tarot-cards/Traveler_carrying_wands_toward_c__202608162246.jpeg'),
  'Traveler_overlooking_ocean_on_ta__202608162246.jpeg': require('@/assets/images/tarot-cards/Traveler_overlooking_ocean_on_ta__202608162246.jpeg'),
  'Traveler_walking_away_from_cups_202608162246.jpeg': require('@/assets/images/tarot-cards/Traveler_walking_away_from_cups_202608162246.jpeg'),
  'Travelers_walking_in_winter_land__202608162246.jpeg': require('@/assets/images/tarot-cards/Travelers_walking_in_winter_land__202608162246.jpeg'),
  'Two_of_Cups_Tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Two_of_Cups_Tarot_card_202608162246.jpeg'),
  'Two_of_Wands_tarot_card_202608162246.jpeg': require('@/assets/images/tarot-cards/Two_of_Wands_tarot_card_202608162246.jpeg'),
  'Warrior_defending_Seven_of_Wands_202608162246.jpeg': require('@/assets/images/tarot-cards/Warrior_defending_Seven_of_Wands_202608162246.jpeg'),
  'Warrior_holding_swords_on_battle__202608162246.jpeg': require('@/assets/images/tarot-cards/Warrior_holding_swords_on_battle__202608162246.jpeg'),
  'Warrior_on_horseback_holding_wand_202608162246.jpeg': require('@/assets/images/tarot-cards/Warrior_on_horseback_holding_wand_202608162246.jpeg'),
  'Warrior_riding_mystical_chariot_202608162246.jpeg': require('@/assets/images/tarot-cards/Warrior_riding_mystical_chariot_202608162246.jpeg'),
  'Warrior_standing_with_nine_wands_202608162246.jpeg': require('@/assets/images/tarot-cards/Warrior_standing_with_nine_wands_202608162246.jpeg'),
  'Wheel_of_Fortune_Tarot_Card_202608162246.jpeg': require('@/assets/images/tarot-cards/Wheel_of_Fortune_Tarot_Card_202608162246.jpeg'),
  'Woman_interacting_with_mystical___202608162246.jpeg': require('@/assets/images/tarot-cards/Woman_interacting_with_mystical___202608162246.jpeg'),
  'Woman_standing_in_moonlit_garden_202608162246.jpeg': require('@/assets/images/tarot-cards/Woman_standing_in_moonlit_garden_202608162246.jpeg'),
};

const img = (name: string) => IMAGES[name];

const CARDS: TarotCard[] = [
  { name: 'The Fool', meaning: 'New beginnings, adventure, and trusting the journey ahead.', image: img('The_Fool_tarot_card_artwork_202608162246.jpeg') },
  { name: 'The Magician', meaning: 'Manifestation, skill, and strong willpower.', image: img('Magician_tarot_card_with_altar_202608162246.jpeg') },
  { name: 'The High Priestess', meaning: 'Intuition, mystery, and hidden inner wisdom.', image: img('The_High_Priestess_Tarot_Card_202608162246.jpeg') },
  { name: 'The Empress', meaning: 'Nurturing, abundance, and creative growth.', image: img('The_Empress_tarot_card_202608162246.jpeg') },
  { name: 'The Emperor', meaning: 'Structure, authority, and steady leadership.', image: img('Emperor_seated_on_throne_202608162246.jpeg') },
  { name: 'The Hierophant', meaning: 'Tradition, guidance, and spiritual wisdom.', image: img('Tarot_card_depicting_The_Hierophant_202608162246.jpeg') },
  { name: 'The Lovers', meaning: 'Love, harmony, and a meaningful choice awaits.', image: img('The_Lovers_Tarot_card_artwork_202608162246.jpeg') },
  { name: 'The Chariot', meaning: 'Determination, willpower, and moving forward.', image: img('Warrior_riding_mystical_chariot_202608162246.jpeg') },
  { name: 'Strength', meaning: 'Courage, inner strength, and gentle control.', image: img('Woman_interacting_with_mystical___202608162246.jpeg') },
  { name: 'The Hermit', meaning: 'Reflection, solitude, and inner guidance.', image: img('The_Hermit_tarot_card_art_202608162246.jpeg') },
  { name: 'Wheel of Fortune', meaning: 'Change, cycles, and a fortunate turn of luck.', image: img('Wheel_of_Fortune_Tarot_Card_202608162246.jpeg') },
  { name: 'Justice', meaning: 'Fairness, truth, and balanced decisions.', image: img('Female_figure_holding_sword_and_202608162246.jpeg') },
  { name: 'The Hanged Man', meaning: 'Letting go and seeing things from a new angle.', image: img('The_Hanged_Man_tarot_card_202608162246.jpeg') },
  { name: 'Death', meaning: 'Transformation, endings, and fresh beginnings.', image: img('Skeletal_rider_on_pale_horse_202608162246.jpeg') },
  { name: 'Temperance', meaning: 'Balance, patience, and gentle moderation.', image: img('Temperance_tarot_card_design_202608162246.jpeg') },
  { name: 'The Devil', meaning: 'Attachments, temptation, and breaking free.', image: img('Gargoyle_tarot_card_design_202608162246.jpeg') },
  { name: 'The Tower', meaning: 'Sudden change and liberating transformation.', image: img('The_Tower_tarot_card_struck_202608162246.jpeg') },
  { name: 'The Star', meaning: 'Hope, inspiration, and healing renewal.', image: img('Mystical_woman_pouring_water_202608162246.jpeg') },
  { name: 'The Moon', meaning: 'Dreams, intuition, and hidden truths surfacing.', image: img('Tarot_card_depicting_The_Moon_202608162246.jpeg') },
  { name: 'The Sun', meaning: 'Success, vitality, and pure joy on the way.', image: img('Tarot_card_depicting_The_Sun_202608162246.jpeg') },
  { name: 'Judgement', meaning: 'Awakening, renewal, and honest self-reflection.', image: img('Gothic_tarot_card_Judgement_202608162246.jpeg') },
  { name: 'The World', meaning: 'Completion, achievement, and celebration of your journey.', image: img('The_World_tarot_card_202608162246.jpeg') },
  { name: 'Ace of Wands', meaning: 'New passion, inspiration, and fresh opportunity.', image: img('Ace_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Two of Wands', meaning: 'Planning ahead and bold future vision.', image: img('Two_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Three of Wands', meaning: 'Expansion, foresight, and horizons opening.', image: img('Traveler_overlooking_ocean_on_ta__202608162246.jpeg') },
  { name: 'Four of Wands', meaning: 'Celebration, harmony, and a joyful homecoming.', image: img('Four_of_Wands_Tarot_card_202608162246.jpeg') },
  { name: 'Five of Wands', meaning: 'Friendly rivalry and healthy competition.', image: img('Five_of_Wands_Tarot_card_202608162246.jpeg') },
  { name: 'Six of Wands', meaning: 'Victory, recognition, and public success.', image: img('Warrior_on_horseback_holding_wand_202608162246.jpeg') },
  { name: 'Seven of Wands', meaning: 'Standing your ground and defending your position.', image: img('Warrior_defending_Seven_of_Wands_202608162246.jpeg') },
  { name: 'Eight of Wands', meaning: 'Fast progress and swift, exciting change.', image: img('Eight_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Nine of Wands', meaning: 'Resilience, persistence, and a final push.', image: img('Warrior_standing_with_nine_wands_202608162246.jpeg') },
  { name: 'Ten of Wands', meaning: 'Burden, hard work, and carrying too much.', image: img('Traveler_carrying_wands_toward_c__202608162246.jpeg') },
  { name: 'Page of Wands', meaning: 'Enthusiasm, exploration, and creative spark.', image: img('Page_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Knight of Wands', meaning: 'Adventure, high energy, and spontaneity.', image: img('Knight_of_Wands_Tarot_card_202608162246.jpeg') },
  { name: 'Queen of Wands', meaning: 'Confidence, charisma, and warmth.', image: img('Gothic_Queen_holding_glowing_wand_202608162246.jpeg') },
  { name: 'King of Wands', meaning: 'Leadership, vision, and bold decisive action.', image: img('King_of_Wands_tarot_card_202608162246.jpeg') },
  { name: 'Ace of Cups', meaning: 'New love, emotional flow, and open-hearted joy.', image: img('Tarot_card_depicting_Ace_of_202608162246.jpeg') },
  { name: 'Two of Cups', meaning: 'Partnership, connection, and mutual love.', image: img('Two_of_Cups_Tarot_card_202608162246.jpeg') },
  { name: 'Three of Cups', meaning: 'Friendship, celebration, and joyful community.', image: img('Three_of_Cups_Tarot_Card_202608162246.jpeg') },
  { name: 'Four of Cups', meaning: 'Contemplation, apathy, and a moment to look inward.', image: img('Dark-robed_figure_holding_golden__202608162246.jpeg') },
  { name: 'Five of Cups', meaning: 'Loss, regret, and learning to move forward.', image: img('Mystical_figure_seated_with_cups_202608162246.jpeg') },
  { name: 'Six of Cups', meaning: 'Nostalgia, childhood memories, and simple pleasures.', image: img('Tarot_card_depicting_six_cups_202608162246.jpeg') },
  { name: 'Seven of Cups', meaning: 'Choices, imagination, and sorting through options.', image: img('Figure_viewing_seven_mystical_cups_202608162246.jpeg') },
  { name: 'Eight of Cups', meaning: 'Walking away and seeking deeper meaning.', image: img('Traveler_walking_away_from_cups_202608162246.jpeg') },
  { name: 'Nine of Cups', meaning: 'Wishes granted, satisfaction, and contentment.', image: img('Figure_contemplating_beneath_anc__202608162246.jpeg') },
  { name: 'Ten of Cups', meaning: 'Happiness, family, and emotional fulfillment.', image: img('Ten_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Page of Cups', meaning: 'Creative dreams, intuition, and gentle messages.', image: img('Page_of_Cups_Tarot_Card_202608162246.jpeg') },
  { name: 'Knight of Cups', meaning: 'Romance, charm, and following your heart.', image: img('Knight_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Queen of Cups', meaning: 'Compassion, empathy, and emotional depth.', image: img('Queen_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'King of Cups', meaning: 'Emotional balance, calm, and wise leadership.', image: img('King_of_Cups_tarot_card_202608162246.jpeg') },
  { name: 'Ace of Swords', meaning: 'Clarity, breakthrough, and mental focus.', image: img('Hand_holding_sword_tarot_card_202608162246.jpeg') },
  { name: 'Two of Swords', meaning: 'A difficult choice and balancing two sides.', image: img('Blindfolded_woman_holding_crosse__202608162246.jpeg') },
  { name: 'Three of Swords', meaning: 'Heartbreak, sorrow, and healing from pain.', image: img('Gothic_heart_pierced_by_swords_202608162246.jpeg') },
  { name: 'Four of Swords', meaning: 'Rest, recovery, and quiet restoration.', image: img('Four_of_Swords_tarot_card_202608162246.jpeg') },
  { name: 'Five of Swords', meaning: 'Conflict, tension, and choosing your battles.', image: img('Warrior_holding_swords_on_battle__202608162246.jpeg') },
  { name: 'Six of Swords', meaning: 'Transition, moving on, and calmer waters ahead.', image: img('Tarot_card_showing_traveler_cros__202608162246.jpeg') },
  { name: 'Seven of Swords', meaning: 'Deception, strategy, and careful moves.', image: img('Seven_of_Swords_tarot_card_202608162246.jpeg') },
  { name: 'Eight of Swords', meaning: 'Feeling trapped and finding your own freedom.', image: img('Blindfolded_woman_standing_with___202608162246.jpeg') },
  { name: 'Nine of Swords', meaning: 'Anxiety, worry, and the power of the mind.', image: img('Figure_sitting_with_nine_swords_202608162246.jpeg') },
  { name: 'Ten of Swords', meaning: 'A painful ending and the start of recovery.', image: img('Tarot_card_Ten_of_Swords_202608162246.jpeg') },
  { name: 'Page of Swords', meaning: 'Curiosity, new ideas, and sharp observation.', image: img('Gothic_warrior_holding_sword_202608162246.jpeg') },
  { name: 'Knight of Swords', meaning: 'Bold action, speed, and determined pursuit.', image: img('Gothic_knight_charging_with_sword_202608162246.jpeg') },
  { name: 'Queen of Swords', meaning: 'Clarity, independence, and honest truth.', image: img('Gothic_queen_holding_sword_202608162246.jpeg') },
  { name: 'King of Swords', meaning: 'Authority, logic, and fair judgement.', image: img('Gothic_king_holding_sword_202608162246.jpeg') },
  { name: 'Ace of Pentacles', meaning: 'New opportunity, prosperity, and a solid start.', image: img('Hand_presenting_glowing_golden_p__202608162246.jpeg') },
  { name: 'Two of Pentacles', meaning: 'Balance, juggling priorities, and flexibility.', image: img('Gothic_figure_balancing_two_pent__202608162246.jpeg') },
  { name: 'Three of Pentacles', meaning: 'Teamwork, craftsmanship, and recognition.', image: img('Gothic_artisans_working_Three_of__202608162246.jpeg') },
  { name: 'Four of Pentacles', meaning: 'Security, stability, and holding on tightly.', image: img('Scholar_studying_glowing_golden___202608162246.jpeg') },
  { name: 'Five of Pentacles', meaning: 'Hardship, support, and faith through tough times.', image: img('Travelers_walking_in_winter_land__202608162246.jpeg') },
  { name: 'Six of Pentacles', meaning: 'Generosity, giving, and receiving help.', image: img('Six_of_Pentacles_tarot_card_202608162246.jpeg') },
  { name: 'Seven of Pentacles', meaning: 'Patience, investment, and reaping rewards.', image: img('Gardener_observing_tree_with_pen__202608162246.jpeg') },
  { name: 'Eight of Pentacles', meaning: 'Dedication, skill, and diligent practice.', image: img('Gothic_craftsman_engraving_golde__202608162246.jpeg') },
  { name: 'Nine of Pentacles', meaning: 'Self-sufficiency, luxury, and quiet independence.', image: img('Woman_standing_in_moonlit_garden_202608162246.jpeg') },
  { name: 'Ten of Pentacles', meaning: 'Legacy, family wealth, and lasting security.', image: img('Gothic_tarot_card_Ten_of_202608162246.jpeg') },
  { name: 'Page of Pentacles', meaning: 'Learning, ambition, and a promising new start.', image: img('Figure_standing_by_river_tarot_202608162246.jpeg') },
  { name: 'Knight of Pentacles', meaning: 'Reliability, patience, and steady progress.', image: img('Gothic_knight_holding_golden_pen__202608162246.jpeg') },
  { name: 'Queen of Pentacles', meaning: 'Nurturing, practicality, and grounded comfort.', image: img('Queen_of_Pentacles_tarot_card_202608162246.jpeg') },
  { name: 'King of Pentacles', meaning: 'Abundance, stability, and wise management.', image: img('King_of_Pentacles_Tarot_card_202608162246.jpeg') },
];

const shuffle = (arr: TarotCard[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function TarotScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [drawn, setDrawn] = useState<TarotCard[]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [active, setActive] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [warned, setWarned] = useState(false);
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const shuffleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const cardWidth = width - 56;

  const draw = () => {
    if (shuffling) return;
    setShuffling(true);
    setWarned(false);
    setShowDetails(false);
    setActive(0);
    shuffleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shuffleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(shuffleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(shuffleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setShuffling(false);
      const drawnCards = shuffle(CARDS).slice(0, 3);
      setDrawn(drawnCards);
      const entry: ReadingHistory = {
        date: new Date().toISOString(),
        cards: drawnCards.map((c) => ({ name: c.name, meaning: c.meaning })),
        spread: 'three',
      };
      const updated = [entry, ...history].slice(0, 5);
      setHistory(updated);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    });
  };

  const drawAgain = () => setWarned(true);

  const resetForAnother = () => {
    setDrawn([]);
    setWarned(false);
    setShowDetails(false);
  };

  const deckSpin = shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const deckShift = shuffleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 30, 0] });
  const deckOpacity = shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });

  const stackCards = [CARDS[0], CARDS[11], CARDS[37], CARDS[63], CARDS[20]];

  const combinationText =
    drawn.length === 3
      ? `Your three cards — ${drawn[0].name}, ${drawn[1].name} and ${drawn[2].name} — together speak of ${drawn[0].meaning} Then ${drawn[1].meaning} And finally, ${drawn[2].meaning}`
      : '';

  const shareWhatsApp = () => {
    if (drawn.length !== 3) return;
    const labels = [t('tarot.past'), t('tarot.present'), t('tarot.future')];
    const text = drawn
      .map((c, i) => `${labels[i]}: ${c.name}\n${c.meaning}`)
      .join('\n\n');
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`);
  };

  const labels = [t('tarot.past'), t('tarot.present'), t('tarot.future')];

  return (
    <ThemedView style={styles.screen}>
      <Image source={BG} style={StyleSheet.absoluteFill} contentFit="cover" pointerEvents="none" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Tarot Reading</ThemedText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {drawn.length === 0 ? (
            <View style={styles.center}>
              <Animated.View
                style={[styles.deck, { opacity: deckOpacity, transform: [{ rotate: deckSpin }, { translateX: deckShift }] }]}>
                {stackCards.map((c, i) => (
                  <Image
                    key={i}
                    source={c.image}
                    style={[styles.stackCard, { transform: [{ rotate: `${(i - 2) * 6}deg` }, { translateX: (i - 2) * 8 }] }]}
                  />
                ))}
              </Animated.View>
              <ThemedText style={styles.hint}>
                {shuffling ? 'Shuffling the deck…' : 'Think of your question, then draw three cards.'}
              </ThemedText>
              <TouchableOpacity style={styles.btnGold} onPress={draw} disabled={shuffling}>
                <Image source={TAROT_ICON} style={styles.btnIcon} />
                <ThemedText style={styles.btnTextGold}>{shuffling ? 'Shuffling…' : 'Draw Cards'}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnHistory} onPress={() => setShowHistory(true)}>
                <Ionicons name="time" size={20} color="#121212" />
                <ThemedText style={styles.btnTextGold}>{t('tarot.history')}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ThemedText style={styles.sectionTitle}>Your Reading</ThemedText>

              <View style={styles.readingBox}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pagerContent}
                  onScroll={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
                    if (idx !== active && idx >= 0 && idx < drawn.length) setActive(idx);
                  }}
                  scrollEventThrottle={16}>
                  {drawn.map((c, i) => (
                    <View key={c.name} style={[styles.page, { width: cardWidth }]}>
                      <ThemedText style={styles.cardLabel}>{labels[i]}</ThemedText>
                      <Image source={c.image} style={styles.bigCard} />
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.dots}>
                  {drawn.map((c, i) => (
                    <View key={c.name} style={[styles.dot, i === active && styles.dotActive]} />
                  ))}
                </View>
                <ThemedText style={styles.activeName}>{drawn[active].name}</ThemedText>
                <ThemedText style={styles.activeMeaning}>{drawn[active].meaning}</ThemedText>
              </View>

              {!showDetails ? (
                <TouchableOpacity style={styles.btnGold} onPress={() => setShowDetails(true)}>
                  <Ionicons name="eye" size={20} color="#121212" />
                  <ThemedText style={styles.btnTextGold}>{t('tarot.viewReading')}</ThemedText>
                </TouchableOpacity>
              ) : (
                <View style={styles.details}>
                  <ThemedText style={styles.detailTitle}>Your Reading</ThemedText>
                  {drawn.map((c, i) => (
                    <View key={c.name} style={styles.detailCard}>
                      <ThemedText style={styles.detailNo}>{labels[i]}</ThemedText>
                      <View style={styles.detailBody}>
                        <ThemedText style={styles.detailName}>{c.name}</ThemedText>
                        <ThemedText style={styles.detailMeaning}>{c.meaning}</ThemedText>
                      </View>
                    </View>
                  ))}
                  <View style={styles.comboCard}>
                    <Ionicons name="sparkles" size={18} color={ACCENT} />
                    <ThemedText style={styles.comboText}>{combinationText}</ThemedText>
                  </View>
                </View>
              )}

              {!warned ? (
                <>
                  <TouchableOpacity style={styles.shareBtn} onPress={shareWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
                    <ThemedText style={styles.btnText}>Share on WhatsApp</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/tarot-chat',
                        params: {
                          cards: JSON.stringify(drawn.map((c) => ({ name: c.name, meaning: c.meaning }))),
                          combo: combinationText,
                        },
                      })
                    }>
                    <Ionicons name="chatbubble-ellipses" size={20} color="#ffffff" />
                    <ThemedText style={styles.chatBtnText}>Discuss with Chat</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={drawAgain}>
                    <Ionicons name="refresh" size={20} color="#ffffff" />
                    <ThemedText style={styles.btnText}>Draw Again</ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.warnBox}>
                  <Ionicons name="alert-circle" size={22} color={ACCENT} />
                  <ThemedText style={styles.warnText}>
                    A tarot draw is allowed only once for a person. Think of another person and draw again.
                  </ThemedText>
                  <TouchableOpacity style={styles.btnSmall} onPress={resetForAnother}>
                    <Ionicons name="person-add" size={18} color="#ffffff" />
                    <ThemedText style={styles.btnText}>Draw for Someone Else</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{t('tarot.history')}</ThemedText>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color="#EEEDE0" />
                </TouchableOpacity>
              </View>
              {history.length === 0 ? (
                <ThemedText style={styles.emptyText}>No readings yet.</ThemedText>
              ) : (
                <ScrollView>
                  {history.map((entry, idx) => (
                    <View key={idx} style={styles.historyCard}>
                      <ThemedText style={styles.historyDate}>
                        {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}
                      </ThemedText>
                      {entry.cards.map((c, ci) => (
                        <ThemedText key={ci} style={styles.historyItem}>
                          {labels[ci]}: {c.name}
                        </ThemedText>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16, paddingBottom: 40 },
  center: { alignItems: 'center', gap: 20, paddingTop: 24 },
  deck: { width: '62%', aspectRatio: 3 / 4.1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stackCard: { position: 'absolute', width: '84%', aspectRatio: 2 / 3, borderRadius: 16 },
  hint: { fontSize: 17, color: '#7E7E78', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 14 },
  readingBox: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.5)',
    backgroundColor: 'rgba(29,29,28,0.4)',
  },
  pagerContent: {},
  page: { alignItems: 'center', paddingHorizontal: 14 },
  bigCard: { width: '78%', aspectRatio: 2 / 3, borderRadius: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(68,64,57,0.6)' },
  dotActive: { backgroundColor: GOLD, width: 22 },
  activeName: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', textAlign: 'center' },
  activeMeaning: { fontSize: 14, color: '#7E7E78', marginTop: 6, lineHeight: 21, textAlign: 'center' },
  details: { marginTop: 8, gap: 12 },
  detailTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 2 },
  detailCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(29,29,28,0.5)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.3)',
  },
  detailNo: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: ACCENT,
    color: '#ffffff', fontSize: 14, fontWeight: 'bold',
    textAlign: 'center', lineHeight: 30, marginRight: 12,
  },
  detailBody: { flex: 1 },
  detailName: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  detailMeaning: { fontSize: 14, color: '#7E7E78', marginTop: 4, lineHeight: 20 },
  comboCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(41,39,35,0.6)',
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  comboText: { flex: 1, fontSize: 14, color: '#7E7E78', lineHeight: 21 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, marginTop: 14,
    shadowColor: ACCENT, shadowOpacity: 0.8, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GOLD,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, marginTop: 14,
    shadowColor: GOLD, shadowOpacity: 0.9, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  chatBtnText: { color: '#121212', fontSize: 15, fontWeight: '700' },
  btnGold: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#B09C66',
    borderRadius: 16, paddingVertical: 18, paddingHorizontal: 44,
    marginTop: 8, alignSelf: 'center',
    shadowColor: '#B09C66', shadowOpacity: 0.9, shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  btnIcon: { width: 26, height: 26 },
  btnTextGold: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
  btnSmall: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, marginTop: 12,
  },
  warnBox: {
    backgroundColor: 'rgba(41,39,35,0.6)',
    borderColor: ACCENT, borderWidth: 1,
    borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8,
  },
  warnText: { fontSize: 14, color: '#7E7E78', lineHeight: 20, textAlign: 'center', marginTop: 8 },
  cardLabel: { fontSize: 14, fontWeight: '700', color: GOLD, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, marginTop: 14,
    shadowColor: '#25D366', shadowOpacity: 0.9, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  btnHistory: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'transparent',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, marginTop: 4,
    borderWidth: 1, borderColor: ACCENT,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1D1D1C', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  emptyText: { color: '#7E7E78', textAlign: 'center', marginTop: 24, fontSize: 14 },
  historyCard: {
    backgroundColor: 'rgba(41,39,35,0.6)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)', marginBottom: 10,
  },
  historyDate: { fontSize: 12, color: GOLD, marginBottom: 6 },
  historyItem: { fontSize: 13, color: '#EEEDE0', marginTop: 2 },
});
