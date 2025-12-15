// DeCap main component
import React, { useState, useEffect } from 'react';
import { DeCapProps } from '../types';
import { generateChallenge, getDisplayWord, validateLetterPlacement } from '../lib/challenge';
import './DeCap.css';

export const DeCap: React.FC<DeCapProps> = ({
  mode,
  userWallet,
  onSuccess,
  onFailure,
  className,
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [challenge, setChallenge] = useState(() => generateChallenge(mode === 'simple' ? 'easy' : 'medium'));
  const [sliderValue, setSliderValue] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [alignmentTimer, setAlignmentTimer] = useState<NodeJS.Timeout | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [walletSigning, setWalletSigning] = useState(false);
  const [walletSigned, setWalletSigned] = useState(false);
  const [walletSignature, setWalletSignature] = useState<string | null>(null);
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextStep, setNextStep] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isModalOpen || isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onFailure();
          setIsModalOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalOpen, isCompleted, onFailure]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (value: number) => {
    console.log('Slider value changed:', value); // Debug log
    setSliderValue(value);
    
    // Check if slider is in correct position
    // Calculate target position to align with the empty slot in the word display
    const wordLength = challenge.content.targetWord.length;
    const missingIndex = challenge.content.missingLetterIndex;
    
    // Calculate position based on visual letter slots (accounting for gaps)
    // Each letter slot takes up space, and we need to align with the center of the missing slot
    const slotWidth = 48; // Letter slot width in pixels
    const slotGap = 10; // Gap between slots in pixels
    const totalWordWidth = (wordLength * slotWidth) + ((wordLength - 1) * slotGap);
    
    // Position of the missing slot center relative to the word
    const slotPosition = (missingIndex * (slotWidth + slotGap)) + (slotWidth / 2);
    
    // Convert to percentage of slider width (assuming slider matches word width)
    const targetPosition = (slotPosition / totalWordWidth) * 100;
    
    const tolerance = 6; // 6% tolerance for alignment (more precise)
    
    console.log('Slider value:', value, 'Target position:', targetPosition, 'Missing index:', challenge.content.missingLetterIndex, 'Word length:', wordLength);
    
    const isCurrentlyAligned = Math.abs(value - targetPosition) <= tolerance;
    
    if (isCurrentlyAligned && !isAligned) {
      // Just became aligned - start 2-second timer
      setIsAligned(true);
      
      const timer = setTimeout(() => {
        // After 2 seconds of being aligned, show success
        setShowSuccess(true);
        setIsCompleted(true);
        
        // Auto-continue after showing success for 1 second
        setTimeout(() => {
          handleContinue();
        }, 1000);
      }, 2000);
      
      setAlignmentTimer(timer);
    } else if (!isCurrentlyAligned && isAligned) {
      // No longer aligned - cancel timer and reset
      setIsAligned(false);
      setShowSuccess(false);
      if (alignmentTimer) {
        clearTimeout(alignmentTimer);
        setAlignmentTimer(null);
      }
    }
  };

  const handleContinue = () => {
    if (currentStep === 1 && !showSuccess) return; // Only allow continue after successful alignment
    if (currentStep === 2 && !walletSigned) return; // Only allow continue after successful signing
    
    if (mode === 'simple') {
      // Simple mode: animate to success page, then complete
      animateToStep(2);
      setShowFinalSuccess(true);
      
      // Auto-close after 4 seconds and call onSuccess
      setTimeout(() => {
        onSuccess({
          success: true,
          puzzleCompleted: true,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode,
        });
        setIsModalOpen(false);
      }, 4000);
    } else if (currentStep === 1) {
      // Advanced mode: proceed to wallet signing with animation
      animateToStep(2);
    } else if (currentStep === 2) {
      // Advanced mode: proceed to final success page with animation
      animateToStep(3);
      setShowFinalSuccess(true);
      
      // Auto-close after 5 seconds and call onSuccess
      setTimeout(() => {
        onSuccess({
          success: true,
          puzzleCompleted: true,
          walletSignature: walletSignature!,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode,
        });
        setIsModalOpen(false);
      }, 5000);
    }
  };

  const animateToStep = (step: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setNextStep(step);
    
    // After fade out completes, change step and fade in
    setTimeout(() => {
      setCurrentStep(step);
      setNextStep(null);
      
      // Small delay then fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300); // Match CSS transition duration
  };

  const handleWalletSign = async () => {
    if (!userWallet || walletSigning) return;
    
    setWalletSigning(true);
    
    try {
      // Generate nonce message
      const nonce = Math.random().toString(36).substring(2, 15);
      const message = `DeCap Verification\nNonce: ${nonce}\nChallenge: ${challenge.id}\nTimestamp: ${Date.now()}`;
      
      // Sign message with wallet
      const signature = await userWallet.signMessage(message);
      
      setWalletSignature(signature);
      setWalletSigned(true);
      setWalletSigning(false);
      
      // Auto-continue after 1.5 seconds with animation
      setTimeout(() => {
        handleContinue();
      }, 1500);
      
    } catch (error) {
      console.error('Wallet signing failed:', error);
      setWalletSigning(false);
      onFailure();
      setIsModalOpen(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
    setChallenge(generateChallenge(mode === 'simple' ? 'easy' : 'medium'));
    setSliderValue(0);
    setTimeLeft(20);
    setIsCompleted(false);
    setIsAligned(false);
    setShowSuccess(false);
    setWalletSigning(false);
    setWalletSigned(false);
    setWalletSignature(null);
    setShowFinalSuccess(false);
    setIsTransitioning(false);
    setNextStep(null);
    if (alignmentTimer) {
      clearTimeout(alignmentTimer);
      setAlignmentTimer(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onFailure();
  };

  const displayWord = getDisplayWord(challenge);
  const totalSteps = mode === 'simple' ? 2 : 3;

  return (
    <>
      <div className={className} onClick={openModal}>
        {children}
      </div>
      
      {isModalOpen && (
        <div className="decap-modal-overlay">
          <div className="decap-modal">
            {/* Header */}
            <div className="decap-modal-header">
              <button className="decap-close-btn" onClick={closeModal}>×</button>
              <div className="decap-progress-bars">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div 
                    key={i} 
                    className={`decap-progress-bar ${i < currentStep ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Title and Timer */}
            <div className="decap-title-section">
              <h2 className="decap-title">Complete verification</h2>
              <div className="decap-timer">{formatTime(timeLeft)}</div>
            </div>

            {/* Animated Step Container */}
            <div className={`decap-step-container ${isTransitioning ? 'transitioning' : ''}`}>
              {currentStep === 1 && (
              <div className="decap-puzzle-step">
                {/* Word Display */}
                <div className="decap-word-display">
                  {challenge.content.targetWord.split('').map((letter, index) => (
                    <div 
                      key={index}
                      className={`decap-letter-slot ${
                        index === challenge.content.missingLetterIndex 
                          ? showSuccess ? 'filled' : 'missing' 
                          : ''
                      }`}
                    >
                      {index === challenge.content.missingLetterIndex 
                        ? (showSuccess ? challenge.content.correctLetter : '') 
                        : letter}
                    </div>
                  ))}
                </div>

                {/* Success Messages */}
                {isAligned && (
                  <div className="decap-success-message">
                    ✓ Letter placed correctly!
                  </div>
                )}
                
                {showSuccess && (
                  <div className="decap-success-message">
                    ✓ Puzzle solved!
                  </div>
                )}

                {/* Custom Slider with Letter Thumb - Hide when completed */}
                {!showSuccess && (
                  <div className="decap-slider-container">
                    <div className="decap-slider-track">
                      {/* Letter above slider */}
                      <div 
                        className="decap-slider-thumb"
                        style={{ 
                          left: `calc(${sliderValue}% - 28px)`,
                          transition: isAligned ? 'left 0.1s ease-out' : 'left 0.05s ease-out'
                        }}
                      >
                        <div className="decap-letter-tile">
                          {challenge.content.correctLetter}
                        </div>
                      </div>
                      
                      {/* Circle indicator on track */}
                      <div 
                        className="decap-slider-circle"
                        style={{ 
                          left: `calc(${sliderValue}% - 10px)`,
                          transition: isAligned ? 'left 0.1s ease-out' : 'left 0.05s ease-out'
                        }}
                      />
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        className="decap-slider-input"
                      />
                    </div>
                    <div className="decap-slider-instruction">
                      Slide {challenge.content.correctLetter} to its correct position
                    </div>
                  </div>
                )}



                {/* Continue Button */}
                <button 
                  className={`decap-continue-btn ${showSuccess ? 'enabled' : ''}`}
                  onClick={handleContinue}
                  disabled={!showSuccess}
                >
                  Continue →
                </button>
              </div>
            )}

            {currentStep === 2 && mode === 'advanced' && (
              <div className="decap-wallet-step">
                <h2 className="decap-wallet-title">Sign Nonce Message</h2>
                
                <div className="decap-wallet-description">
                  You will be prompted to sign a Nonce message with the wallet you are using for this transaction
                </div>

                {walletSigned && (
                  <div className="decap-success-message">
                    ✓ Message signed successfully!
                  </div>
                )}

                {!walletSigned && (
                  <button 
                    className="decap-sign-btn"
                    onClick={handleWalletSign}
                    disabled={walletSigning}
                  >
                    {walletSigning ? 'Signing...' : 'Sign Message'}
                  </button>
                )}

                <button 
                  className={`decap-continue-btn ${walletSigned ? 'enabled' : ''}`}
                  onClick={handleContinue}
                  disabled={!walletSigned}
                >
                  Continue →
                </button>
              </div>
            )}

            {((currentStep === 2 && mode === 'simple') || currentStep === 3) && (
              <div className="decap-success-final">
                <div className="decap-confetti-container">
                  {/* Confetti particles */}
                  {Array.from({ length: 50 }, (_, i) => (
                    <div 
                      key={i} 
                      className="decap-confetti-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
                      }}
                    />
                  ))}
                </div>

                <div className="decap-success-icon">
                  <div className="decap-checkmark">✓</div>
                </div>

                <h2 className="decap-success-title">Verification Complete</h2>
                <p className="decap-success-message">Thank you for your patience</p>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeCap;