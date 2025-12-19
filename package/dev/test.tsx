import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DeCap } from '../src/components/DeCap';
import { ThemeProvider } from '../src/themes/ThemeProvider';
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

// Theme Selector Component
const ThemeSelector = ({ currentTheme, onThemeChange }: { 
  currentTheme: 'light' | 'dark' | 'auto', 
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void 
}) => (
  <div style={{ 
    marginBottom: '20px', 
    padding: '15px', 
    border: '1px solid var(--decap-color-text-secondary, #e1e5e9)', 
    borderRadius: '8px',
    background: 'var(--decap-color-surface, #f8f9fa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  }}>
    <label htmlFor="theme-select" style={{ 
      fontWeight: 'bold',
      color: 'var(--decap-color-text, #333)',
      fontSize: '14px'
    }}>
      🎨 Theme:
    </label>
    <select 
      id="theme-select"
      value={currentTheme} 
      onChange={(e) => onThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
      style={{ 
        padding: '8px 12px', 
        borderRadius: '6px', 
        border: '1px solid var(--decap-color-text-secondary, #ccc)',
        fontSize: '14px',
        background: 'var(--decap-color-background, white)',
        color: 'var(--decap-color-text, #333)',
        cursor: 'pointer'
      }}
    >
      <option value="light">☀️ Light Theme</option>
      <option value="dark">🌙 Dark Theme</option>
      <option value="auto">🔄 Auto (System)</option>
    </select>
    <span style={{ 
      fontSize: '12px', 
      color: 'var(--decap-color-text-secondary, #666)',
      background: 'var(--decap-color-surface, #e3f2fd)',
      padding: '4px 8px',
      borderRadius: '4px'
    }}>
      Active: {currentTheme}
    </span>
  </div>
);

// Main Test App Component
const TestApp = () => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('light');

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

  return (
    <ThemeProvider theme={selectedTheme}>
      <div className="test-container" style={{ 
        padding: '40px', 
        fontFamily: 'Arial, sans-serif',
        background: 'var(--decap-color-background, white)',
        color: 'var(--decap-color-text, #333)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        transition: 'all 0.3s ease'
      }}>
        <h1 style={{ color: 'var(--decap-color-primary, #007AFF)', marginBottom: '10px' }}>
          🔐 DeCap SDK Theme Testing
        </h1>
        <p style={{ color: 'var(--decap-color-text-secondary, #666)', marginBottom: '30px' }}>
          Test theme switching and component behavior
        </p>
        
        <ThemeSelector 
          currentTheme={selectedTheme} 
          onThemeChange={setSelectedTheme} 
        />
        
        <div className="wallet-info" style={{
          background: 'var(--decap-color-surface, #f5f7fa)',
          padding: '16px',
          borderRadius: '8px',
          margin: '20px 0',
          fontSize: '14px',
          color: 'var(--decap-color-text-secondary, #666)',
          border: '1px solid var(--decap-color-text-secondary, #e1e5e9)'
        }}>
          <strong>Mock Wallet:</strong> 0x1234...5678<br />
          <small>This is a simulated wallet for testing purposes</small>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--decap-color-text, #333)', fontSize: '18px' }}>Simple Mode Test</h2>
          <SimpleTest />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--decap-color-text, #333)', fontSize: '18px' }}>Advanced Mode Test</h2>
          <AdvancedTest />
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: 'var(--decap-color-text, #333)', fontSize: '16px' }}>Result:</h3>
          <pre id="result" className="result" style={{ 
            padding: '16px', 
            border: '1px solid var(--decap-color-text-secondary, #e1e5e9)', 
            borderRadius: '8px',
            background: 'var(--decap-color-surface, #f5f5f5)',
            color: 'var(--decap-color-text, #333)',
            minHeight: '100px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            Click a button above to test verification...
          </pre>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Render the main app
const appRoot = createRoot(document.getElementById('app')!);
appRoot.render(<TestApp />);