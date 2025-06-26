import fs from 'fs';
import path from 'path';
import { syllable } from 'syllable';

/**
 * Reads and runs a Ku file by breaking it into 3-line haikus.
 @param {string} filePath  // The path to the .ku file.
 */

function runKu(filePath) {
  // Read the contents of the file at filePath as a UTF-8 string,
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');

  // Loop through every 3 lines at a time — each 3 lines is one haiku.
  for (let i = 0; i < lines.length; i += 3) {
    const haiku = lines.slice(i, i + 3); // Extract the 3-line block
    if (haiku.length < 3) continue;

    try {
      validateHaiku(haiku, i);
      interpretHaiku(haiku);
      console.log(`✅ Valid haiku:\n${haiku.join('\n')}\n`);
    } catch (err) {
      console.error(err.message + '\n');
    }
  }
}

// Syllable Counting — using the 'syllable' package for accuracy
function countSyllables(line) {
  return syllable(line);
}

// Validate each haiku follows 5-7-5
function validateHaiku(haiku, index) {
  const expected = [5, 7, 5];
  for (let i = 0; i < 3; i++) {
    const actual = countSyllables(haiku[i]);
    console.log(`[checking]: ${haiku[i]} (${actual}/${expected[i]})`);
    if (actual !== expected[i]) {
      throw new Error(
        `❌ Invalid haiku at lines ${index + 1}-${index + 3}: Line ${i + 1} has ${actual} syllables (expected ${expected[i]})`
      );
    }
  }
}

const memory = {};

const numberWords = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10
};

function parseExpression(line) {
  const words = line.toLowerCase().split(' ');

  const first = numberWords[words[0]] || 0;
  const operator = words[2]; // 'plus' or 'minus'
  const second = numberWords[words[3]] || 0;

  if (operator === 'plus') return first + second;
  if (operator === 'minus') return first - second;

  return first;
}

function interpretHaiku(haiku) {
  const [line1, line2, line3] = haiku;

  const varMatch = line1.match(/the (.+?) remembers/);
  if (!varMatch) return;

  const varName = varMatch[1].trim();
  const value = parseExpression(line2);
  memory[varName] = value;

  if (line3.toLowerCase().includes('echo')) {
    console.log(`${varName}: ${memory[varName]}`);
  }
}

// Get the file path from the command-line arguments.
// process.argv[2] is the 3rd argument (first two are: node path, script path)
const file = process.argv[2];

// If no argument is provided, show usage and exit.
if (!file) {
  console.error('Usage: node interpreter/ku.js <path-to-ku-file>');
  process.exit(1);
}

// Resolve the full file path and pass it to the runKu function
runKu(path.resolve(file));
