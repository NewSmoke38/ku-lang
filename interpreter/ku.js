import fs from 'fs';
import path from 'path';
import { syllable } from 'syllable';

/**
 * Reads and runs a Ku file by breaking it into 3-line haikus.
 @param {string} filePath  // The path to the .ku file.
 */

function runKu(filePath) {
  const rawLines = fs.readFileSync(filePath, 'utf8').split('\n');

  const blocks = rawLines.reduce((acc, line) => {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (acc.current.length === 3) acc.haikus.push(acc.current);
      acc.current = [];
    } else {
      acc.current.push(trimmed);
    }
    return acc;
  }, { haikus: [], current: [] });

  if (blocks.current.length === 3) {
    blocks.haikus.push(blocks.current);
  }

  const haikus = blocks.haikus;

  let skipNext = false;
  let skipCurrent = false;

  for (let i = 0; i < haikus.length; i++) {
    const haiku = haikus[i];
    if (haiku.length < 3) continue;

    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (skipCurrent) {
      skipCurrent = false;
      continue;
    }

    const summonMatch = haiku[0].match(/^summon (.+)$/);
    if (summonMatch) {
      const funcName = summonMatch[1].trim().toLowerCase();
      try {
        const expected = [5, 7, 5];
        for (let j = 0; j < 3; j++) {
          const actual = countSyllables(haiku[j]);
          if (actual !== expected[j]) {
            throw new Error(`❌ Invalid haiku for function '${funcName}': Line ${j + 1} has ${actual} syllables (expected ${expected[j]})`);
          }
        }
        functions[funcName] = haiku;
        console.log(`🔮 Summoned function '${funcName}'`);
      } catch (err) {
        console.error(err.message + '\n');
      }
      continue;
    }

    const callMatch = haiku[0].match(/call the (.+?)( now)?$/);
    if (callMatch) {
      const funcName = callMatch[1].trim().toLowerCase();
      const summoned = functions[funcName];
      if (summoned) {
        try {
          // Execute the summoned function
          interpretHaiku(summoned);
          console.log(`🌀 Called function '${funcName}'`);
          
          // Display fused haiku
          displayFusedHaiku(summoned, haiku);
        } catch (err) {
          console.error(`❌ Error in function '${funcName}': ${err.message}\n`);
        }
      } else {
        console.error(`❌ Function '${funcName}' not found`);
      }
      continue;
    }

    const conditionMatch = haiku[0].match(/if (.+?) is greater/);
    if (conditionMatch) {
      const varName = conditionMatch[1].trim();
      const nextHaiku = haikus[i + 1];
      if (!nextHaiku || nextHaiku.length < 3) {
        console.error(`❌ No haiku to evaluate after condition at lines ${i * 3 + 1}-${i * 3 + 3}`);
        continue;
      }

      const compareLine = nextHaiku[1]; // Line 2 of the next haiku
      const compareWords = compareLine.toLowerCase().split(' ');
      const compareTo = numberWords[compareWords[1]] || 0;

      if (memory[varName] > compareTo) {
        if (nextHaiku.length === 3) {
          try {
            validateHaiku(nextHaiku, i + 1);
            interpretHaiku(nextHaiku);
            console.log(`✅ Valid haiku:\n${nextHaiku.join('\n')}\n`);
          } catch (err) {
            console.error(err.message + '\n');
          }
        }
      }
      skipNext = true;
      continue;
    }

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

const functions = {};

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
  if (!varMatch) {
    return;
  }

  const varName = varMatch[1].trim();
  const value = parseExpression(line2);
  memory[varName] = value;

  if (line3.toLowerCase().includes('echo')) {
    console.log(`${varName}: ${memory[varName]}`);
  }
}

// Simplified haiku fusion function
function fuseHaikus(summonedHaiku, callingHaiku) {
  // Take line 1 from summoned, line 2 from calling, line 3 from summoned
  const line1 = summonedHaiku[1]; // Second line from summoned (more poetic)
  const line2 = callingHaiku[1];  // Second line from calling (more poetic)
  const line3 = summonedHaiku[2]; // Third line from summoned (more poetic)
  
  return [line1, line2, line3];
}

function displayFusedHaiku(summonedHaiku, callingHaiku) {
  const fusedHaiku = fuseHaikus(summonedHaiku, callingHaiku);
  console.log(`\n✨ Fused Haiku:`);
  console.log(fusedHaiku.join('\n'));
  console.log('');
}

// ASCII art for functions
const functionArt = {
  'darkened crow': [
    '    ___    ',
    '   (o o)   ',
    '  (  V  )  ',
    ' /--m-m--\\ ',
    '   |   |   '
  ],
  'default': [
    '   ___   ',
    '  (^_^)  ',
    '  /   \\  '
  ]
};

function getArtForFunction(funcName) {
  // Try to find specific art for the function
  for (const [key, art] of Object.entries(functionArt)) {
    if (funcName.includes(key) || key.includes(funcName)) {
      return art;
    }
  }
  return functionArt.default;
}

function displayFunctionArt(funcName) {
  const art = getArtForFunction(funcName);
  console.log(`\n🎨 ${funcName.toUpperCase()}:`);
  console.log(art.join('\n'));
  console.log('');
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
