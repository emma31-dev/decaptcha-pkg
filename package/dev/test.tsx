import React from 'react';
import { createRoot } from 'react-dom/client';
import { DeCap } from '../src/components/DeCap';
import { WalletConnection, VerificationProof } from '../src/types';

// Mock wallet for testing
const mockWallet: WalletConnection = {
  address: '0x1234567890123456789012345678901234567890',
  isConnected: true,
  signMessage: async (message: string): Promise<string> => {
    // Simulate wallet signing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock signature (in real app, this would be actual wallet signature)
    return `0x${'a'.repeat(130)}${Date.now().toString(16)}`;
  }
};

const showResult = (result: any, isError = false) => {
  const resultDiv = document.getElementById('result');
  if (resultDiv) {
    resultDiv.className = `result ${isError ? 'error' : 'success'}`;
    resultDiv.textContent = JSON.stringify(result, null, 2);
  }
};

const handleSuccess = (proof: VerificationProof) => {
  console.log('✅ Verification Success:', proof);
  showResult({
    status: 'SUCCESS',
    mode: proof.mode,
    puzzleCompleted: proof.puzzleCompleted,
    walletSignature: proof.walletSignature ? 'Present' : 'Not Required',
    token: proof.token,
    challengeId: proof.challengeId,
    timestamp: new Date(proof.timestamp).toISOString()
  });
};

const handleFailure = () => {
  console.log('❌ Verification Failed');
  showResult({
    status: 'FAILED',
    reason: 'User failed verification or cancelled',
    timestamp: new Date().toISOString()
  }, true);
};

// Simple Mode Test
const SimpleTest = () => (
  <DeCap
    mode="simple"
    userWallet={mockWallet}
    onSuccess={handleSuccess}
    onFailure={handleFailure}
    className="test-button"
  >
    Test Simple Mode (Puzzle Only)
  </DeCap>
);

// Advanced Mode Test
const AdvancedTest = () => (
  <DeCap
    mode="advanced"
    userWallet={mockWallet}
    onSuccess={handleSuccess}
    onFailure={handleFailure}
    className="test-button"
  >
    Test Advanced Mode (Puzzle + Wallet)
  </DeCap>
);

// Render components
const simpleRoot = createRoot(document.getElementById('decap-simple')!);
const advancedRoot = createRoot(document.getElementById('decap-advanced')!);

simpleRoot.render(<SimpleTest />);
advancedRoot.render(<AdvancedTest />);