// useCaptchaLogic hook - Complete captcha flow management
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChallengeData, DragState, VerificationState, WalletConnection } from '../types';
import { generateChallenge } from '../lib/challenge';
import { signMessage, generateSigningMessage, verifySignature } from '../utils/verifySignature';
import { generateSecureNonce } from '../utils/uuid';

export interface UseCaptchaLogicReturn {
  // Modal state
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  
  // Step navigation
  currentStep: number;
  nextStep: (data?: any) => void;
  previousStep: () => void;
  resetModal: () => void;
  animateToStep: (step: number) => void;
  
  // Challenge state
  challenge: ChallengeData;
  regenerateChallenge: () => void;
  
  // Puzzle state
  sliderValue: number;
  setSliderValue: (value: number) => void;
  isAligned: boolean;
  isCompleted: boolean;
  showSuccess: boolean;
  
  // Drag and drop state
  dragState: DragState;
  updateDragState: (updates: Partial<DragState>) => void;
  
  // Timer state
  timeLeft: number;
  formatTime: (seconds: number) => string;
  
  // Wallet signing state
  walletSigning: boolean;
  walletSigned: boolean;
  walletSignature: string | null;
  signWithWallet: (wallet: WalletConnection) => Promise<void>;
  
  // Verification state
  verificationState: VerificationState;
  
  // Transition state
  isTransitioning: boolean;
}

export const useCaptchaLogic = (
  mode: 'simple' | 'advanced' | 'auto' = 'simple',
  onSuccess?: (proof: any) => void,
  onFailure?: () => void
): UseCaptchaLogicReturn => {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Challenge state
  const [challenge, setChallenge] = useState<ChallengeData>(() => 
    generateChallenge(mode === 'simple' ? 'easy' : 'medium')
  );
  
  // Puzzle state
  const [sliderValue, setSliderValue] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedLetter: null,
    dropZoneActive: false,
    isNearCorrectSlot: false,
    isAligned: false,
    dragPosition: { x: 0, y: 0 }
  });
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Wallet state
  const [walletSigning, setWalletSigning] = useState(false);
  const [walletSigned, setWalletSigned] = useState(false);
  const [walletSignature, setWalletSignature] = useState<string | null>(null);
  
  // Verification state
  const [verificationState, setVerificationState] = useState<VerificationState>({
    step: 1,
    challengeId: challenge.id,
    userResponses: {},
    startTime: Date.now(),
    attempts: 0,
    maxAttempts: 3
  });
  
  // Refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alignmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer countdown effect
  useEffect(() => {
    if (!isOpen || isCompleted) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onFailure?.();
          closeModal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, isCompleted, onFailure]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (alignmentTimerRef.current) clearTimeout(alignmentTimerRef.current);
    };
  }, []);
  
  // Calculate target position for alignment
  const targetPosition = React.useMemo(() => {
    const wordLength = challenge.content.targetWord.length;
    const missingIndex = challenge.content.missingLetterIndex;
    const slotWidth = 48;
    const slotGap = 12;
    const totalWordWidth = (wordLength * slotWidth) + ((wordLength - 1) * slotGap);
    const slotCenterPosition = (missingIndex * (slotWidth + slotGap)) + (slotWidth / 2);
    return (slotCenterPosition / totalWordWidth) * 100;
  }, [challenge.content.targetWord, challenge.content.missingLetterIndex]);
  
  // Modal controls
  const openModal = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(1);
    setChallenge(generateChallenge(mode === 'simple' ? 'easy' : 'medium'));
    setSliderValue(0);
    setTimeLeft(30);
    setIsCompleted(false);
    setIsAligned(false);
    setShowSuccess(false);
    setWalletSigning(false);
    setWalletSigned(false);
    setWalletSignature(null);
    setIsTransitioning(false);
    setVerificationState({
      step: 1,
      challengeId: challenge.id,
      userResponses: {},
      startTime: Date.now(),
      attempts: 0,
      maxAttempts: 3
    });
    setDragState({
      isDragging: false,
      draggedLetter: null,
      dropZoneActive: false,
      isNearCorrectSlot: false,
      isAligned: false,
      dragPosition: { x: 0, y: 0 }
    });
  }, [mode, challenge.id]);
  
  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (alignmentTimerRef.current) clearTimeout(alignmentTimerRef.current);
    onFailure?.();
  }, [onFailure]);
  
  const resetModal = useCallback(() => {
    setCurrentStep(1);
    setIsOpen(false);
    setIsCompleted(false);
    setIsAligned(false);
    setShowSuccess(false);
    setWalletSigning(false);
    setWalletSigned(false);
    setWalletSignature(null);
    setIsTransitioning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (alignmentTimerRef.current) clearTimeout(alignmentTimerRef.current);
  }, []);
  
  // Step navigation
  const animateToStep = useCallback((step: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(step);
      setVerificationState(prev => ({ ...prev, step }));
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  }, [isTransitioning]);
  
  const nextStep = useCallback((data?: any) => {
    if (currentStep === 1 && !showSuccess) return;
    if (currentStep === 2 && !walletSigned && mode === 'advanced') return;
    
    if (mode === 'simple') {
      animateToStep(2);
      
      setTimeout(() => {
        onSuccess?.({
          success: true,
          puzzleCompleted: true,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode,
        });
        closeModal();
      }, 3000);
    } else if (currentStep === 1) {
      animateToStep(2);
    } else if (currentStep === 2) {
      animateToStep(3);
      
      setTimeout(() => {
        onSuccess?.({
          success: true,
          puzzleCompleted: true,
          walletSignature: walletSignature!,
          token: `decap_${Date.now()}`,
          timestamp: Date.now(),
          challengeId: challenge.id,
          mode,
        });
        closeModal();
      }, 3000);
    }
  }, [currentStep, showSuccess, walletSigned, mode, animateToStep, onSuccess, challenge.id, walletSignature, closeModal]);
  
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      animateToStep(currentStep - 1);
    }
  }, [currentStep, animateToStep]);
  
  // Challenge management
  const regenerateChallenge = useCallback(() => {
    const newChallenge = generateChallenge(mode === 'simple' ? 'easy' : 'medium');
    setChallenge(newChallenge);
    setVerificationState(prev => ({ ...prev, challengeId: newChallenge.id }));
    setSliderValue(0);
    setIsAligned(false);
    setIsCompleted(false);
    setShowSuccess(false);
  }, [mode]);
  
  // Slider value handler with alignment detection
  const handleSliderValue = useCallback((value: number) => {
    if (!dragState.isDragging) return;
    
    setSliderValue(value);
    
    const tolerance = 8;
    const isCurrentlyAligned = Math.abs(value - targetPosition) <= tolerance;
    
    if (isCurrentlyAligned && !isAligned) {
      setIsAligned(true);
      
      alignmentTimerRef.current = setTimeout(() => {
        setShowSuccess(true);
        setIsCompleted(true);
        
        setTimeout(() => {
          nextStep();
        }, 1000);
      }, 2000);
    } else if (!isCurrentlyAligned && isAligned) {
      setIsAligned(false);
      setShowSuccess(false);
      if (alignmentTimerRef.current) {
        clearTimeout(alignmentTimerRef.current);
        alignmentTimerRef.current = null;
      }
    }
  }, [dragState.isDragging, targetPosition, isAligned, nextStep]);
  
  // Drag state updater
  const updateDragState = useCallback((updates: Partial<DragState>) => {
    setDragState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Wallet signing
  const signWithWallet = useCallback(async (wallet: WalletConnection) => {
    if (!wallet || walletSigning) return;
    
    setWalletSigning(true);
    
    try {
      const secureNonce = generateSecureNonce();
      const message = generateSigningMessage(
        wallet.address,
        'decap.app',
        secureNonce,
        {
          statement: 'Sign this message to complete DeCap verification.',
          requestId: challenge.id,
        }
      );
      
      const signature = await wallet.signMessage(message);
      
      // Verify signature
      const isValid = verifySignature(message, signature, wallet.address);
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      setWalletSignature(signature);
      setWalletSigned(true);
      setWalletSigning(false);
      
      setTimeout(() => {
        nextStep();
      }, 1500);
      
    } catch (error) {
      console.error('Wallet signing failed:', error);
      setWalletSigning(false);
      setVerificationState(prev => ({ 
        ...prev, 
        attempts: prev.attempts + 1 
      }));
      
      if (verificationState.attempts >= verificationState.maxAttempts - 1) {
        onFailure?.();
        closeModal();
      }
    }
  }, [walletSigning, challenge.id, nextStep, verificationState.attempts, verificationState.maxAttempts, onFailure, closeModal]);
  
  // Time formatter
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  return {
    // Modal state
    isOpen,
    openModal,
    closeModal,
    
    // Step navigation
    currentStep,
    nextStep,
    previousStep,
    resetModal,
    animateToStep,
    
    // Challenge state
    challenge,
    regenerateChallenge,
    
    // Puzzle state
    sliderValue,
    setSliderValue: handleSliderValue,
    isAligned,
    isCompleted,
    showSuccess,
    
    // Drag state
    dragState,
    updateDragState,
    
    // Timer state
    timeLeft,
    formatTime,
    
    // Wallet state
    walletSigning,
    walletSigned,
    walletSignature,
    signWithWallet,
    
    // Verification state
    verificationState,
    
    // Transition state
    isTransitioning,
  };
};