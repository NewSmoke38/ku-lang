import fs from 'fs';
import path from 'path';
import { syllable } from 'syllable';

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

  for (let i = 0; i < haikus.length; i++) {     
    const haiku = haikus[i];
    if (haiku.length < 3) continue;

    if (skipNext) {
      skipNext = false;
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
          interpretHaiku(summoned);
          console.log(`🌀 Called function '${funcName}'`);
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

      const compareLine = nextHaiku[1];
      const compareWords = compareLine.toLowerCase().split(' ');
      const compareTo = numberWords[compareWords[1]] || 0;

      if (memory[varName] > compareTo) {
        try {
          validateHaiku(nextHaiku, i + 1);
          interpretHaiku(nextHaiku);
          console.log(`✅ Valid haiku:\n${nextHaiku.join('\n')}\n`);
        } catch (err) {
          console.error(err.message + '\n');
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

function countSyllables(line) {
  return syllable(line);
}

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
  const operator = words[2];
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

function fuseHaikus(summonedHaiku, callingHaiku) {
  const line1 = summonedHaiku[1];
  const line2 = callingHaiku[1];
  const line3 = summonedHaiku[2];
  return [line1, line2, line3];
}

function displayFusedHaiku(summonedHaiku, callingHaiku) {
  const fusedHaiku = fuseHaikus(summonedHaiku, callingHaiku);
  console.log(`\n✨ Fused Haiku:`);
  console.log(fusedHaiku.join('\n'));
  console.log('');
}

const file = process.argv[2];

if (!file) {
  console.error('Usage: node interpreter/ku.js <path-to-ku-file>');
  process.exit(1);
}

runKu(path.resolve(file));
