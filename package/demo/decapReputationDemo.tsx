/**
 * DeCap Reputation Integration Demo
 * 
 * This demo shows how the DeCap component uses the reputation score prop
 * to automatically determine CAPTCHA behavior in auto mode.
 */

import React, { useState, useEffect } from 'react';
import { DeCap, fetchReputationScore } from '../src';

// Simulated wallet connection
const mockWallet = {
  address: '0x957c9ea2a3e698e50f42fe78e39184acc74ebb62',
  signMessage: async (message: string) => {
    console.log('📝 Signing message:', message);
    return `0x${'a'.repeat(130)}`; // Mock signature
  },
  isConnected: true
};

function DeCapReputationDemo() {
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState<'low' | 'medium' | 'high'>('medium');

  // Simulate different reputation scores for testing
  const testScores = {
    low: 25,    // Should trigger advanced mode (full CAPTCHA + signature)
    medium: 55, // Should trigger simple mode (CAPTCHA only)
    high: 85    // Should trigger bypass mode (skip CAPTCHA)
  };

  // Fetch reputation on component mount
  useEffect(() => {
    fetchReputation();
  }, []);

  const fetchReputation = async () => {
    setLoading(true);
    try {
      const result = await fetchReputationScore(mockWallet.address, {
        apiKey: process.env.API_KEY_TOKEN // Use real data with API key
      });
      
      // Override with test score for demonstration
      const testScore = testScores[testMode];
      const modifiedResult = {
        ...result,
        score: testScore,
        trustLevel: testScore >= 70 ? 'high' : testScore >= 40 ? 'medium' : 'low',
        captchaMode: testScore >= 70 ? 'bypass' : testScore >= 40 ? 'simple' : 'advanced'
      };
      
      setReputation(modifiedResult);
      console.log('🎯 Reputation loaded:', modifiedResult);
    } catch (error) {
      console.error('❌ Failed to fetch reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (proof: any) => {
    console.log('✅ Verification successful:', proof);
    alert(`Verification successful! Mode: ${proof.mode}, Token: ${proof.token}`);
  };

  const handleFailure = () => {
    console.log('❌ Verification failed');
    alert('Verification failed!');
  };

  const changeTestMode = (mode: 'low' | 'medium' | 'high') => {
    setTestMode(mode);
    // Update reputation with new test score
    if (reputation) {
      const testScore = testScores[mode];
      const updatedReputation = {
        ...reputation,
        score: testScore,
        trustLevel: testScore >= 70 ? 'high' : testScore >= 40 ? 'medium' : 'low',
        captchaMode: testScore >= 70 ? 'bypass' : testScore >= 40 ? 'simple' : 'advanced'
      };
      setReputation(updatedReputation);
      console.log('🔄 Updated reputation for testing:', updatedReputation);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 DeCap Reputation Integration Demo</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📊 Wallet Reputation Status</h3>
        {loading ? (
          <p>Loading reputation...</p>
        ) : reputation ? (
          <div>
            <p><strong>Address:</strong> {mockWallet.address}</p>
            <p><strong>Score:</strong> {reputation.score}/100</p>
            <p><strong>Trust Level:</strong> {reputation.trustLevel.toUpperCase()}</p>
            <p><strong>CAPTCHA Mode:</strong> {reputation.captchaMode}</p>
            <p><strong>Expected Behavior:</strong> {
              reputation.captchaMode === 'bypass' ? '✅ Skip CAPTCHA entirely' :
              reputation.captchaMode === 'simple' ? '🟡 Show simple CAPTCHA only' :
              '🔴 Show full CAPTCHA + wallet signature'
            }</p>
          </div>
        ) : (
          <p>No reputation data</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🧪 Test Different Reputation Scores</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => changeTestMode('low')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: testMode === 'low' ? '#ff6b6b' : '#e0e0e0',
              color: testMode === 'low' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Low Trust (25) - Advanced Mode
          </button>
          <button 
            onClick={() => changeTestMode('medium')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: testMode === 'medium' ? '#ffa726' : '#e0e0e0',
              color: testMode === 'medium' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Medium Trust (55) - Simple Mode
          </button>
          <button 
            onClick={() => changeTestMode('high')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: testMode === 'high' ? '#66bb6a' : '#e0e0e0',
              color: testMode === 'high' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            High Trust (85) - Bypass Mode
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🎯 Test DeCap Component</h3>
        <p>Click the button below to test the DeCap component with the current reputation score:</p>
        
        <DeCap
          mode="auto"
          reputationScore={reputation?.score}
          userWallet={mockWallet}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          theme="light"
        >
          <button
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚀 Start Verification
          </button>
        </DeCap>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h4>💡 How It Works</h4>
        <ol>
          <li><strong>Fetch Reputation:</strong> Call <code>fetchReputationScore()</code> when wallet connects</li>
          <li><strong>Store in State:</strong> Save the reputation result in your state management (atom/Redux/Zustand)</li>
          <li><strong>Pass to DeCap:</strong> Set <code>mode="auto"</code> and pass <code>reputationScore</code> prop</li>
          <li><strong>Automatic Behavior:</strong> DeCap automatically chooses the appropriate verification flow:
            <ul>
              <li><strong>Score ≥ 70:</strong> Skip CAPTCHA entirely (bypass)</li>
              <li><strong>Score 40-69:</strong> Show simple CAPTCHA only (simple)</li>
              <li><strong>Score &lt; 40:</strong> Show full CAPTCHA + wallet signature (advanced)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default DeCapReputationDemo;