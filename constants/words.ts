/**
 * Word lists organized by difficulty (shared with server)
 */

import { Difficulty } from '@/lib/types';
import wordLists from './wordLists.json';

export const WORD_LISTS = wordLists as Record<Difficulty, string[]>;

/**
 * Get a random word from the specified difficulty list
 * Optionally exclude previously used words
 */
export const getRandomWord = (
  difficulty: Difficulty,
  usedWords: Set<string> = new Set()
): string => {
  const words = WORD_LISTS[difficulty].filter((w) => !usedWords.has(w));
  
  // Fallback to all words if all have been used
  const availableWords = words.length > 0 ? words : WORD_LISTS[difficulty];
  
  return availableWords[Math.floor(Math.random() * availableWords.length)];
};

/**
 * Get multiple random words from a difficulty level
 */
export const getRandomWords = (
  difficulty: Difficulty,
  count: number
): string[] => {
  const words: string[] = [];
  const used = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const word = getRandomWord(difficulty, used);
    words.push(word);
    used.add(word);
  }
  
  return words;
};
