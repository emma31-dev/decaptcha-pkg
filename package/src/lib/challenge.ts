// Challenge generation utilities
import { ChallengeData, LetterPuzzleContent } from '../types';

// Array of crypto terms for random word selection (max 7 characters)
const CRYPTO_TERMS = [
  'BITCOIN', 'CRYPTO', 'WALLET', 'MINING', 'STAKING', 'DEFI',
  'NFT', 'TOKEN', 'COIN', 'HASH', 'NODE', 'NETWORK', 'SMART', 'GAS', 'FEE', 
  'BRIDGE', 'SWAP', 'POOL', 'YIELD', 'FARM', 'VAULT', 'ORACLE', 'LAYER',
  'SHARD', 'FORK', 'MERGE', 'BURN', 'MINT', 'STAKE', 'LOCK', 'UNLOCK', 
  'CLAIM', 'REWARD', 'SLASH', 'VOTE', 'GOVERN', 'DAO', 'DAPP', 'WEB3', 
  'LEDGER', 'PROOF', 'WORK', 'BLOCK', 'CHAIN', 'PEER', 'SEED'
];

// Generate random letters that don't include the correct letter
const generateDecoyLetters = (correctLetter: string, count: number = 5): string[] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const availableLetters = alphabet.split('').filter(letter => letter !== correctLetter);
  
  const decoys: string[] = [];
  while (decoys.length < count) {
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    if (!decoys.includes(randomLetter)) {
      decoys.push(randomLetter);
    }
  }
  
  return decoys;
};

// Shuffle array utility
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateChallenge = (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): ChallengeData => {
  // Select random word from crypto terms
  const targetWord = CRYPTO_TERMS[Math.floor(Math.random() * CRYPTO_TERMS.length)];
  
  // Select random position for missing letter around the center
  const wordLength = targetWord.length;
  const center = Math.floor(wordLength / 2);
  
  // Define range around center (avoid first and last letters)
  const rangeSize = Math.max(1, Math.floor(wordLength / 3)); // About 1/3 of word length
  const minIndex = Math.max(1, center - rangeSize);
  const maxIndex = Math.min(wordLength - 2, center + rangeSize);
  
  const missingLetterIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
  
  const correctLetter = targetWord[missingLetterIndex];
  
  // Generate decoy letters based on difficulty
  const decoyCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const decoyLetters = generateDecoyLetters(correctLetter, decoyCount);
  
  // Combine correct letter with decoys and shuffle
  const availableLetters = shuffleArray([correctLetter, ...decoyLetters]);

  const content: LetterPuzzleContent = {
    targetWord,
    missingLetterIndex,
    availableLetters,
    correctLetter,
  };

  return {
    id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'puzzle',
    content,
    difficulty,
    timeLimit: difficulty === 'easy' ? 120 : difficulty === 'medium' ? 90 : 60,
  };
};

// Validate if the dropped letter is correct
export const validateLetterPlacement = (
  droppedLetter: string, 
  challenge: ChallengeData
): boolean => {
  return droppedLetter === challenge.content.correctLetter;
};

// Get display word with missing letter as underscore
export const getDisplayWord = (challenge: ChallengeData): string => {
  const { targetWord, missingLetterIndex } = challenge.content;
  return targetWord
    .split('')
    .map((letter, index) => index === missingLetterIndex ? '_' : letter)
    .join(' ');
};