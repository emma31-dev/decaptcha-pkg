// DeCap main component
import React, { useState, useEffect, useMemo } from 'react';
import { DeCapProps } from '../types';
import { generateChallenge } from '../lib/challenge';
import { ThemeProvider } from '../themes/ThemeProvider';
import './DeCap.css';

export const DeCap: React.FC<DeCapProps> = ({
  mode,
  userWallet,
  onSuccess,
  onFailure,
  className,
  children,
  theme = 'light',
  useTheme,
  reputationScore,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Determine actual mode based on reputation score when mode is 'auto'
  const actualMode = useMemo(() => {
    if (mode !== 'auto') return mode;
    
    if (reputationScore !== undefined) {
      // Use provided reputation score to determine mode
      if (reputationScore >= 70) return 'bypass'; // Skip CAPTCHA entirely
      if (reputationScore >= 40) return 'simple'; // Simple CAPTCHA
      return 'advanced'; // Full CAPTCHA + wallet signature
    }
    
    // Fallback to simple mode if no reputation score provided
    return 'simple';
  }, [mode, reputationScore]);

  // Theme detection with memoization for performance
  const currentTheme = useMemo(() => {
    if (theme === 'auto' && useTheme) {
      return useTheme();
    }
    return theme;
  }, [theme, useTheme]);

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

  // Global mouse/touch up listener to handle drag end outside slider
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-calculate target position to avoid recalculating on every slider change
  const targetPosition = React.useMemo(() => {
    const wordLength = challenge.content.targetWord.length;
    const missingIndex = challenge.content.missingLetterIndex;
    const slotWidth = 48;
    const slotGap = 12;
    const totalWordWidth = (wordLength * slotWidth) + ((wordLength - 1) * slotGap);
    const slotCenterPosition = (missingIndex * (slotWidth + slotGap)) + (slotWidth / 2);
    return (slotCenterPosition / totalWordWidth) * 100;
  }, [challenge.content.targetWord, challenge.content.missingLetterIndex]);

  const handleSliderChange = (value: number) => {
    // Only allow changes if user is actively dragging
    if (!isDragging) return;
    
    setSliderValue(value);
    
    const tolerance = 8;
    const isCurrentlyAligned = Math.abs(value - targetPosition) <= tolerance;
    
    if (isCurrentlyAligned && !isAligned) {
      setIsAligned(true);
      
      const timer = setTimeout(() => {
        setShowSuccess(true);
        setIsCompleted(true);
        
        // Ensure state is updated before calling handleContinue
        setTimeout(() => {
          if (actualMode === 'simple') {
            // Simple mode: animate to success page, then complete
            animateToStep(2);
            
            // Auto-close after 2 seconds and call onSuccess
            setTimeout(() => {
              onSuccess({
                success: true,
                puzzleCompleted: true,
                token: `decap_${Date.now()}`,
                timestamp: Date.now(),
                challengeId: challenge.id,
                mode: mode, // Original mode (could be 'auto')
              });
              closeModalAnimated();
            }, 2000);
          } else {
            // Advanced mode: proceed to wallet signing
            animateToStep(2);
          }
        }, 500);
      }, 2000);
      
      setAlignmentTimer(timer);
    } else if (!isCurrentlyAligned && isAligned) {
      setIsAligned(false);
      setShowSuccess(false);
      if (alignmentTimer) {
        clearTimeout(alignmentTimer);
        setAlignmentTimer(null);
      }
    }
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
  };

  const handleSliderTouchStart = () => {
    setIsDragging(true);
  };

  const handleSliderTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    // Prevent click events from changing slider value
    e.preventDefault();
    e.stopPropagation();
  };

  const handleContinue = () => {
    if (currentStep === 1 && !showSuccess) return; // Only allow continue after successful alignment
    if (currentStep === 2 && !walletSigned) return; // Only allow continue after successful signing
    
    if (actualMode === 'simple') {
      // Simple mode: animate to success page, then complete
      animateToStep(2);
      
      // Auto-close after 3 seconds and call onSuccess
      setTimeout(() => {
        onSuccess({
          success: true,
          puzzleCompleted: true,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode: mode, // Original mode (could be 'auto')
        });
        closeModalAnimated();
      }, 500);
    } else if (currentStep === 1) {
      // Advanced mode: proceed to wallet signing with animation
      animateToStep(2);
    } else if (currentStep === 2) {
      // Advanced mode: proceed to final success page with animation
      animateToStep(3);
      
      // Auto-close after 2 seconds and call onSuccess
      setTimeout(() => {
        onSuccess({
          success: true,
          puzzleCompleted: true,
          walletSignature: walletSignature!,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode: mode, // Original mode (could be 'auto')
        });
        closeModalAnimated();
      }, 2000);
    }
  };

  const animateToStep = (step: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // After fade out completes, change step and fade in
    setTimeout(() => {
      setCurrentStep(step);
      
      // Small delay then fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200); // Match CSS transition duration
  };

  const handleWalletSign = async () => {
    if (!userWallet || walletSigning) return;
    
    setWalletSigning(true);
    
    try {
      // Generate UUID nonce message
      const nonce = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      const message = `DeCap Verification\nNonce: ${nonce}\nChallenge: ${challenge.id}\nTimestamp: ${Date.now()}`;
      
      // Sign message with wallet
      const signature = await userWallet.signMessage(message);
      
      setWalletSignature(signature);
      setWalletSigned(true);
      setWalletSigning(false);
      
      // Auto-continue after 0.5 seconds - bypass handleContinue guards
      setTimeout(() => {
        // Advanced mode: proceed to final success page with animation
        animateToStep(3);
        
        // Auto-close after 2 seconds and call onSuccess
        setTimeout(() => {
          onSuccess({
            success: true,
            puzzleCompleted: true,
            walletSignature: signature,
            token: `decap_${Date.now()}`,
            timestamp: Date.now(),
            challengeId: challenge.id,
            mode: mode, // Original mode (could be 'auto')
          });
          closeModalAnimated();
        }, 2000);
      }, 500);
      
    } catch (error) {
      console.error('Wallet signing failed:', error);
      setWalletSigning(false);
      onFailure();
      setIsModalOpen(false);
    }
  };

  const openModal = () => {
    // Handle bypass mode - skip CAPTCHA entirely
    if (actualMode === 'bypass') {
      onSuccess({
        success: true,
        puzzleCompleted: true,
        token: `decap_bypass_${Date.now()}`,
        timestamp: Date.now(),
        challengeId: `bypass_${Date.now()}`,
        mode: 'auto', // Original mode was auto
      });
      return;
    }

    setIsModalOpen(true);
    setCurrentStep(1);
    setChallenge(generateChallenge(actualMode === 'simple' ? 'easy' : 'medium'));
    setSliderValue(0);
    setTimeLeft(20);
    setIsCompleted(false);
    setIsAligned(false);
    setShowSuccess(false);
    setWalletSigning(false);
    setWalletSigned(false);
    setWalletSignature(null);
    setIsTransitioning(false);
    setIsDragging(false);
    
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    if (alignmentTimer) {
      clearTimeout(alignmentTimer);
      setAlignmentTimer(null);
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      onFailure();
    }, 300); // Match animation duration
  };

  const closeModalAnimated = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }, 300); // Match animation duration
  };

  const totalSteps = actualMode === 'simple' ? 2 : 3;

  return (
    <ThemeProvider theme={theme} useTheme={useTheme}>
      <div className={className} onClick={openModal}>
        {children}
      </div>
      
      {isModalOpen && (
        <div className={`decap-modal-overlay ${currentTheme} ${isClosing ? 'closing' : ''}`} data-theme={currentTheme}>
          <div className={`decap-modal ${currentTheme} ${isClosing ? 'closing' : ''}`} data-theme={currentTheme}>
            {/* Mobile Drawer Handle */}
            <div className="decap-drawer-handle"></div>
            
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

            {/* Main Content Container */}
            <div className="decap-modal-content">
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
                    <div 
                      className="decap-slider-track"
                      style={{
                        width: `${(challenge.content.targetWord.length * 48) + ((challenge.content.targetWord.length - 1) * 12)}px`
                      }}
                    >
                      {/* Letter above slider */}
                      <div 
                        className="decap-slider-thumb"
                        style={{ 
                          left: `${sliderValue}%`,
                          transform: 'translateX(-50%)'
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
                          left: `${sliderValue}%`,
                          transform: 'translateX(-50%)'
                        }}
                      />
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        onMouseDown={handleSliderMouseDown}
                        onMouseUp={handleSliderMouseUp}
                        onTouchStart={handleSliderTouchStart}
                        onTouchEnd={handleSliderTouchEnd}
                        onClick={handleSliderClick}
                        className="decap-slider-input"
                      />
                    </div>
                    <div className="decap-slider-instruction">
                      Slide {challenge.content.correctLetter} to its correct position
                    </div>
                  </div>
                )}




              </div>
            )}

            {currentStep === 2 && actualMode === 'advanced' && (
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




              </div>
            )}

            {((currentStep === 2 && actualMode === 'simple') || currentStep === 3) && (
              <div className={`decap-success-final ${currentTheme}`}>
                <div className="decap-success-popup">
                  <div className="decap-success-icon-simple">
                    <div className="decap-checkmark-simple">✓</div>
                  </div>
                  
                  <div className="decap-success-content">
                    <h2 className="decap-success-title-optimized">Verified</h2>
                    <p className="decap-success-subtitle">Thank you for your patience</p>
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

export default DeCap;