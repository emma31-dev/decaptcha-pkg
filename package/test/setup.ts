import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock haptic feedback for tests
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
});

// Mock Web3 wallet for tests
(global as any).ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};