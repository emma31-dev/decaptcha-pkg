#!/usr/bin/env node

/**
 * Build validation script for DeCap SDK
 * 
 * Validates the build output and ensures all exports are working correctly.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const packageJsonPath = path.join(__dirname, '../package.json');

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${path.basename(filePath)}`);
  return true;
}

function checkBuildOutput() {
  console.log('🔍 Checking build output...\n');
  
  const requiredFiles = [
    'index.js',
    'index.mjs', 
    'index.d.ts'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!checkFileExists(filePath)) {
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function checkPackageJson() {
  console.log('\n📦 Checking package.json exports...\n');
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check main fields
  const mainFields = ['main', 'module', 'types'];
  let allFieldsValid = true;
  
  for (const field of mainFields) {
    if (packageJson[field]) {
      const filePath = path.join(__dirname, '..', packageJson[field]);
      if (checkFileExists(filePath)) {
        console.log(`✅ ${field}: ${packageJson[field]}`);
      } else {
        console.error(`❌ ${field}: ${packageJson[field]} (missing)`);
        allFieldsValid = false;
      }
    }
  }
  
  // Check exports
  if (packageJson.exports) {
    console.log('\n📤 Checking exports...');
    
    for (const [exportPath, exportConfig] of Object.entries(packageJson.exports)) {
      console.log(`\n  Export: ${exportPath}`);
      
      if (typeof exportConfig === 'object') {
        for (const [condition, filePath] of Object.entries(exportConfig)) {
          if (typeof filePath === 'string' && filePath.startsWith('./')) {
            const fullPath = path.join(__dirname, '..', filePath);
            if (checkFileExists(fullPath)) {
              console.log(`    ✅ ${condition}: ${filePath}`);
            } else {
              console.error(`    ❌ ${condition}: ${filePath} (missing)`);
              allFieldsValid = false;
            }
          }
        }
      }
    }
  }
  
  return allFieldsValid;
}

function checkBundleSize() {
  console.log('\n📏 Checking bundle sizes...\n');
  
  const files = ['index.js', 'index.mjs'];
  
  for (const file of files) {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`📦 ${file}: ${sizeKB} KB`);
      
      if (stats.size > 50 * 1024) { // 50KB limit
        console.warn(`⚠️  ${file} is larger than 50KB`);
      }
    }
  }
}

function main() {
  console.log('🚀 DeCap SDK Build Validation\n');
  
  const buildValid = checkBuildOutput();
  const packageValid = checkPackageJson();
  
  checkBundleSize();
  
  if (buildValid && packageValid) {
    console.log('\n✅ Build validation passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Build validation failed!');
    process.exit(1);
  }
}

main();