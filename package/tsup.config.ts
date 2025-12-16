import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: ['src/index.ts'],
  
  // Output formats
  format: ['cjs', 'esm'],
  
  // Generate type definitions
  dts: true,
  
  // Code splitting for better tree-shaking
  splitting: true,
  
  // Source maps for debugging
  sourcemap: true,
  
  // Clean dist folder before build
  clean: true,
  
  // Minify for production
  minify: true,
  
  // Target modern browsers and Node.js
  target: 'es2020',
  
  // External dependencies (peer dependencies)
  external: [
    'react',
    'react-dom',
    'ethers'
  ],
  
  // Bundle CSS
  injectStyle: true,
  
  // JSX handling is done in esbuildOptions
  
  // Output directory
  outDir: 'dist',
  
  // Additional configuration
  treeshake: true,
  
  // Banner for license information
  banner: {
    js: '/* DeCap SDK - Decentralized CAPTCHA for Web3 | MIT License */',
  },
  
  // Define globals for UMD build (if needed)
  globalName: 'DeCap',
  
  // Platform-specific builds
  platform: 'browser',
  
  // Esbuild options
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
    options.jsxImportSource = 'react';
  },
  
  // Watch mode for development
  watch: process.env.NODE_ENV === 'development',
  
  // OnSuccess callback
  onSuccess: async () => {
    console.log('✅ Build completed successfully!');
  },
});