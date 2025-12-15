# Implementation Plan

- [-] 1. Set up project structure and core interfaces

  - Create /packages directory structure with /components, /hooks, /utils, /config folders
  - Set up TypeScript configuration and tsup build configuration
  - Initialize PNPM workspace and install dependencies (ethers.js, vitest)
  - Create main index.js export file
  - _Requirements: 3.1, 3.4_

- [ ] 2. Implement utility functions
- [ ] 2.1 Create signature verification utilities
  - Implement /utils/verifySignature.js with ethers.js wallet message signing functions
  - Add SIWE-style signature validation and verification logic
  - Implement secure message generation for wallet signing using ethers utils
  - _Requirements: 2.3, 2.4_

- [ ] 2.2 Implement Orange Protocol reputation fetching
  - Create /utils/fetchOrangeScore.js for Orange Protocol onchain reputation integration
  - Add ethers.js contract integration for Orange Protocol reputation graph
  - Implement score normalization from Orange Protocol to 0-100 scale
  - Add error handling and fallback logic for Orange Protocol API failures
  - _Requirements: 4.4, 3.2_

- [ ] 2.3 Create additional reputation source integrations
  - Add Gitcoin Passport REST API integration in fetchOrangeScore.js
  - Implement Lens Protocol contract integration via ethers.js
  - Create manual scoring fallback using wallet activity (tx count, age, balance)
  - Add reputation source weighting and aggregation logic
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

- [ ] 3.2 Implement useWalletReputation hook
  - Create /hooks/useWalletReputation.js for reputation system integration
  - Add auto mode logic that queries reputation system using fetchOrangeScore utility
  - Implement reputation-based challenge difficulty determination
  - Add CAPTCHA difficulty adjustment logic (bypass >70, easy >50, full <50)
  - Create reputation caching system with expiry to avoid repeated API calls
  - Add fallback logic when reputation services are unavailable
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
  - Create README with usage examples, ethers.js integration, and config setup
  - _Requirements: 3.4, 3.5_