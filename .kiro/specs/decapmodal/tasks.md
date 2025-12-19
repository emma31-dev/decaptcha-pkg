# Implementation Plan

- [-] 1. Set up project structure and core interfaces

  - Create /packages directory structure with /components, /hooks, /utils, /config folders
  - Set up TypeScript configuration and tsup build configuration
  - Initialize PNPM workspace and install dependencies (ethers.js, vitest)
  - Create main index.js export file
  - _Requirements: 3.1, 3.4_

- [ ] 2. Implement utility functions
- [x] 2.1 Create signature verification utilities



  - Implement /utils/verifySignature.js with ethers.js wallet message signing functions
  - Add SIWE-style signature validation and verification logic
  - Implement secure message generation for wallet signing using ethers utils
  - _Requirements: 2.3, 2.4_

- [x] 2.2 Implement custom reputation scoring function in separate module


  - Create /lib/customScoring.ts with standalone reputation calculation function
  - Implement scoring formula: (Tx Activity + Contract Interaction + Age + Diversity) - Risk Flags
  - Add mock blockchain data generation for development and testing
  - Create TypeScript interfaces for WalletData, ScoringWeights, and RiskFlag types
  - Design function to be importable and usable as an atom in dapps
  - Add proper error handling and fallback scoring mechanisms
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 2.3 Update reputation system to use custom scoring
  - Modify /lib/reputation.ts to use custom scoring function instead of Orange Protocol
  - Replace Orange Protocol integration with custom wallet analysis
  - Update scoring thresholds: Low Trust (<40), Medium Trust (40-70), High Trust (70+)


  - Add integration with mock API for blockchain data simulation
  - _Requirements: 5.1, 5.5_

- [ ] 2.4 Create blockchain data fetching utilities
  - Add Etherscan API integration for real transaction data fetching
  - Implement Alchemy SDK integration for contract interaction analysis
  - Create fallback hash-based scoring when APIs are unavailable
  - Add known protocol detection (Uniswap, Aave, etc.) for bonus scoring
  - _Requirements: 4.4, 3.2_



- [ ] 3. Create React hooks
- [ ] 3.1 Implement useCaptchaLogic hook
  - Create /hooks/useCaptchaLogic.js with state management for captcha flow
  - Add modal open/close state handling
  - Implement step navigation and progress tracking
  - Add drag-and-drop state management for letter tiles
  - Create letter placement and verification handlers






  - Integrate wallet signing functionality with ethers.js
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 3.2 Update useWalletReputation hook for custom scoring
  - Update /hooks/useWalletReputation.ts to use custom scoring function
  - Add auto mode logic that queries custom reputation system
  - Implement reputation-based challenge difficulty determination
  - Update CAPTCHA difficulty thresholds (bypass ≥70, simple 40-69, advanced <40)
  - Create reputation caching system with expiry to avoid repeated calculations
  - Add fallback logic when blockchain data is unavailable
  - _Requirements: 3.2, 4.4_

- [ ] 4. Implement DeCap main component
- [ ] 4.1 Create DeCapModal component structure
  - Implement /components/DeCapModal.jsx with proper prop interfaces
  - Add prop validation and default value handling
  - Create component wrapper with children rendering
  - Integrate useCaptchaLogic and useWalletReputation hooks
  - Add auto mode logic that determines CAPTCHA requirement based on reputation score
  - _Requirements: 3.1, 3.3, 3.4_

- [ ] 4.2 Build modal overlay and backdrop
  - Create modal overlay with soft-blurred backdrop
  - Implement click-to-close functionality
  - Add proper z-index and positioning styles
  - _Requirements: 1.1, 1.2, 4.1_

- [ ] 4.3 Implement modal header with progress indicator
  - Create modal header with "Verify You're Human" title
  - Add three-bar progress indicator at top right
  - Implement close button functionality
  - _Requirements: 1.5, 4.2_

- [ ] 4.4 Create instruction step component
  - Build initial instruction display
  - Add word preview with missing letter placeholder
  - Implement step navigation to puzzle
  - _Requirements: 2.1, 4.2_

- [ ] 4.5 Implement puzzle step with drag-and-drop
  - Create word display with "C _ R Y P T O" layout
  - Build horizontal control bar under the word
  - Implement 6 draggable letter tiles below control bar
  - Add drag-and-drop interaction handlers
  - _Requirements: 2.1, 2.2, 4.3_

- [ ] 4.6 Add puzzle validation and animations
  - Implement letter drop validation logic
  - Create green checkmark animation for correct placement
  - Add shake animation with red feedback for incorrect attempts
  - Implement smooth transitions for all interactions
  - _Requirements: 2.2, 4.3, 4.4_

- [ ] 4.7 Create wallet signing step with Ethers.js integration
  - Build wallet message signing interface using ethers.js
  - Add wallet connection status display for ethers providers
  - Implement sign message button with ethers wallet signing
  - Create error handling for ethers wallet interactions and network issues
  - _Requirements: 2.3, 2.4_

- [ ] 4.8 Implement success step
  - Create success confirmation with checkmark
  - Add "✅ Verified. Thank you for your patience." message
  - Implement auto-close functionality
  - Create proof generation and callback execution
  - _Requirements: 1.3, 1.4_

- [ ] 5. Add styling and theming
- [ ] 5.1 Create Apple-inspired base styles
  - Implement CSS modules for component styling
  - Add soft shadows, rounded corners, and clean typography
  - Create responsive design with mobile-first approach
  - _Requirements: 4.1, 4.5_



- [ ] 5.2 Implement animation system
  - Create CSS animations for drag-and-drop feedback
  - Add transition effects for step changes
  - Implement loading and success animations
  - _Requirements: 4.3, 4.4_

- [ ] 5.3 Add theme support
  - Create theme system in themes directory
  - Implement light and dark mode support
  - Add customizable color schemes and spacing
  - _Requirements: 4.1_

- [ ] 6. Integration and testing setup
- [ ] 6.1 Create comprehensive test suite with Vitest
  - Implement DeCap.test.ts with Vitest component testing
  - Add drag-and-drop interaction tests using Vitest DOM utilities
  - Create wallet integration test scenarios with ethers.js mocking
  - Test all success and error flows using Vitest assertions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ]* 6.2 Add unit tests for utilities with Vitest
  - Create Vitest tests for challenge generation logic
  - Add ethers.js signature verification tests
  - Test mode resolver functionality with Vitest
  - Test reputation system calculations using Vitest
  - _Requirements: 2.1, 2.3, 3.2_

- [ ] 6.3 Create gas payment configuration system with Ethers.js
  - Create /config/decap.config.js template for ethers.js gas payer wallet configuration



  - Add gasWallet configuration option in decap.config.js (Option A)
  - Add gasWallet prop support directly to DeCap component (Option B)
  - Implement configuration loader with ethers provider setup
  - Add gas payment integration with ethers wallet signing and transaction handling
  - Keep test ETH amounts very low (0.00000001 VERY) for safety
  - Create documentation for gas payer setup with ethers.js examples
  - _Requirements: 2.3, 3.2_

- [ ] 6.4 Create package build and export configuration with tsup
  - Set up package.json with proper exports and PNPM configuration
  - Configure tsup build for library distribution with TypeScript support
  - Add proper type definitions export and ethers.js peer dependencies
  - Export calculateWalletReputation function as standalone import for atom usage
  - Create README with usage examples, custom scoring integration, and config setup
  - _Requirements: 3.4, 3.5, 5.1_