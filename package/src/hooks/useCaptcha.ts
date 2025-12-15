// useCaptcha hook - placeholder for now
import { useState } from 'react';

export interface UseCaptchaReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  currentStep: number;
  nextStep: (data?: any) => void;
  previousStep: () => void;
  resetModal: () => void;
}

export const useCaptcha = (): UseCaptchaReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // TODO: Implement full hook logic in task 3
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    currentStep,
    nextStep: () => setCurrentStep(prev => prev + 1),
    previousStep: () => setCurrentStep(prev => Math.max(1, prev - 1)),
    resetModal: () => {
      setCurrentStep(1);
      setIsOpen(false);
    },
  };
};