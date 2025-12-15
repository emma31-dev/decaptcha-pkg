// Configuration loader utilities - placeholder for now
import { DeCapConfig } from '../types';

export const loadConfig = (): DeCapConfig => {
  // TODO: Implement config loading from decap.config.js in task 6.3
  return {
    theme: 'light',
    reputationThreshold: {
      bypass: 70,
      easy: 50,
    },
  };
};