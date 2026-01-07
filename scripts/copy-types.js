#!/usr/bin/env node

/**
 * Copy TypeScript definition files from src/ to lib/
 * This ensures .d.ts files are included in the build output
 */

import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const srcDir = join(projectRoot, 'src');
const libDir = join(projectRoot, 'lib');

try {
  // Ensure lib directory exists
  await mkdir(libDir, { recursive: true });

  // Read all files in src directory
  const files = await readdir(srcDir);
  
  // Copy all .d.ts files
  const typeFiles = files.filter(file => file.endsWith('.d.ts'));
  
  for (const file of typeFiles) {
    const srcPath = join(srcDir, file);
    const destPath = join(libDir, file);
    await copyFile(srcPath, destPath);
    console.log(`Copied ${file} to lib/`);
  }

  if (typeFiles.length === 0) {
    console.log('No TypeScript definition files found in src/');
  }
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error('Error copying type definitions:', error);
    process.exit(1);
  }
}

