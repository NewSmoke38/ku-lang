#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { runKu } from '../ku.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🌸 Ku-Lang: A Poetic Esoteric Programming Language');
  console.log('');
  console.log('Usage:');
  console.log('  ku <file.ku>     Run a ku-lang program');
  console.log('  ku --help        Show this help message');
  console.log('  ku --version     Show version');
  console.log('');
  console.log('Examples:');
  console.log('  ku hello.ku');
  console.log('  ku programs/fibonacci.ku');
  console.log('');
  console.log('Learn more: https://github.com/NewSmoke38/ku-lang');
  process.exit(0);
}

if (args[0] === '--help' || args[0] === '-h') {
  console.log('🌸 Ku-Lang: A Poetic Esoteric Programming Language');
  console.log('');
  console.log('Usage: ku <file.ku>');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --version, -v  Show version');
  console.log('');
  console.log('Examples:');
  console.log('  ku hello.ku');
  console.log('  ku programs/fibonacci.ku');
  process.exit(0);
}

if (args[0] === '--version' || args[0] === '-v') {
  const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
  console.log(`ku-lang v${packageJson.version}`);
  process.exit(0);
}

const filePath = args[0];
const resolvedPath = resolve(process.cwd(), filePath);

try {
  runKu(resolvedPath);
} catch (error) {
  console.error(`🌸 Error: ${error.message}`);
  process.exit(1);
} 