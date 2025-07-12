
function rhymes(a, b) {
  const getRhymeEnding = word => {
    const clean = word.toLowerCase().trim();
    const match = clean.match(/[aeiouy]+[^aeiouy]*$/);
    return match ? match[0] : clean.slice(-2);
  };


  const wa = a.trim().toLowerCase().split(/\s+/).pop();
  const wb = b.trim().toLowerCase().split(/\s+/).pop();
  return getRhymeEnding(wa) === getRhymeEnding(wb);
}

function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z]/g, '');
  return clean === clean.split('').reverse().join('');
}


function hasPalindromeWord(haiku) {
const words = haiku.join(' ').toLowerCase().split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');

    if (clean.length > 1 && clean === clean.split('').reverse().join('')) {
      return true;

    }
  }
  return false;
}

function countSyllables(line) {
  return window.syllable(line);
}

function validateHaiku(haiku, index) {
  const expected = [5, 7, 5];
  for (let i = 0; i < 3; i++) {
    const actual = countSyllables(haiku[i]);
    if (actual !== expected[i]) {
      throw new Error(`-_- Invalid haiku at lines ${index + 1}-${index + 3}: Line ${i + 1} has ${actual} syllables (expected ${expected[i]})`);
    }
  }
}

const numberWords = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10
};


function parseExpression(line) {
  const words = line.toLowerCase().split(' ');
  let result = numberWords[words[0]] || 0;
  let i = 1;
  while (i < words.length) {
    const op = words[i];
    const num = numberWords[words[i + 1]];
    
    if (op === 'plus' && num !== undefined) {
      result += num;
      i += 2;
    } else if (op === 'minus' && num !== undefined) {
      result -= num;
      i += 2;
    } else {
      i++;
    }
  }
  return result;
}

function interpretHaiku(haiku, rhymed, memory, outputLines) {
  const [line1, line2, line3] = haiku;
  const varMatch = line1.match(/the (.+?) remember/);
  if (!varMatch) return;
  const varName = varMatch[1].trim();
  const value = parseExpression(line2);
  memory[varName] = value;
  if (rhymed) memory[varName] = value * 2;
  if (line3.toLowerCase().includes('echo')) {
    outputLines.push(`${varName}: ${memory[varName]}`);
  }
}

function fuseHaikus(summonedHaiku, callingHaiku) {
  const line1 = summonedHaiku[1];
  const line2 = callingHaiku[1];
  const line3 = summonedHaiku[2];
  return [line1, line2, line3];
}

function displayFusedHaiku(summonedHaiku, callingHaiku, outputLines) {
  const fusedHaiku = fuseHaikus(summonedHaiku, callingHaiku);
  const hasPalindromeSummoned = hasPalindromeWord(summonedHaiku);
  const hasPalindromeCalling = hasPalindromeWord(callingHaiku);
  let outputHaiku = fusedHaiku;
  if (hasPalindromeSummoned || hasPalindromeCalling) {
    outputLines.push(`🧚🏼 Palindrome detected in fusion! Reversing fused haiku:`);
    const reverseWords = line => line.split(' ').reverse().join(' ');
    outputHaiku = [
      reverseWords(fusedHaiku[2]),
      reverseWords(fusedHaiku[1]),
      reverseWords(fusedHaiku[0])
    ];
  }
  outputLines.push(`✨ Fused Haiku:`);
  outputLines.push(outputHaiku.join('\n'));
}

export function runKuBrowser(code) {
  const lines = code.split(/\r?\n/);
  const blocks = lines.reduce((acc, line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) return acc;
    if (trimmed === '') {
      if (acc.current.length === 3) acc.haikus.push(acc.current);
      acc.current = [];
    } else {
      const codeOnly = trimmed.split('//')[0].trim();
      if (codeOnly) acc.current.push(codeOnly);
    }
    return acc;
  }, { haikus: [], current: [] });
  if (blocks.current.length === 3) blocks.haikus.push(blocks.current);
  const haikus = blocks.haikus;
  let skipNext = false;
  const memory = {};
  const functions = {};
  const outputLines = [];
  for (let i = 0; i < haikus.length; i++) {
    const haiku = haikus[i];
    if (haiku.length < 3) continue;
    if (skipNext) { skipNext = false; continue; }
    const loopMatch = haiku[0].match(/^count from (\w+) to (\w+)/);
    if (loopMatch) {
      const from = numberWords[loopMatch[1]];
      const to = numberWords[loopMatch[2]];
      if (from === undefined || to === undefined || to < from) {
        outputLines.push(`+_+ Invalid loop range: '${haiku[0]}'`);
        continue;
      }
      let line = haiku[1].trim();
      const words = line.split(/\s+/);
      for (let iter = from; iter <= to && words.length > 0; iter++) {
        const consumedLine = words.join(' ');
        const syllables = countSyllables(consumedLine);
        outputLines.push(`🌀 Iteration ${iter}: "${consumedLine}" (${syllables} syllables)`);
        if (words.length > 2) {
          words.shift();
          words.pop();
        } else if (words.length === 2) {
          words.pop();
        } else {
          words.length = 0;
        }
      }
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
            throw new Error(`Invalid haiku for function '${funcName}': Line ${j + 1} has ${actual} syllables (expected ${expected[j]})`);
          }
        }
        const hasPalindrome = hasPalindromeWord(haiku);
        if (hasPalindrome) {
          outputLines.push(`🧚🏼 Palindrome detected in summon! Reversing function '${funcName}':`);
          const reverseWords = line => line.split(' ').reverse().join(' ');
          outputLines.push(reverseWords(haiku[2]));
          outputLines.push(reverseWords(haiku[1]));
          outputLines.push(reverseWords(haiku[0]));
        }
        functions[funcName] = haiku;
        outputLines.push(`🔮 Summoned function '${funcName}'`);
      } catch (err) {
        outputLines.push(err.message);
      }
      continue;
    }
    const callMatch = haiku[0].match(/call the (.+)$/);
    if (callMatch) {
      const funcName = callMatch[1].trim().toLowerCase();
      const summoned = functions[funcName];
      if (summoned) {
        try {
          const hasPalindrome = hasPalindromeWord(haiku);
          if (hasPalindrome) {
            outputLines.push(`🧚🏼 Palindrome detected in calling! Reversing call to '${funcName}':`);
            const reverseWords = line => line.split(' ').reverse().join(' ');
            outputLines.push(reverseWords(haiku[2]));
            outputLines.push(reverseWords(haiku[1]));
            outputLines.push(reverseWords(haiku[0]));
          }
          interpretHaiku(summoned, false, memory, outputLines);
          outputLines.push(`🌀 Called function '${funcName}'`);
          displayFusedHaiku(summoned, haiku, outputLines);
        } catch (err) {
          outputLines.push(`-__- Error in function '${funcName}': ${err.message}`);
        }
      } else {
        outputLines.push(`Function '${funcName}' not found`);
        outputLines.push("💡 Tip: every function call needs a corresponding summon - you can't call a function that hasn't been summoned first");
      }
      continue;
    }
    const conditionMatch = haiku[0].match(/^if (\w+) is greater than (\w+)/);
    if (conditionMatch) {
      const varName = conditionMatch[1].trim();
      const compareToWord = conditionMatch[2].trim();
      const compareTo = numberWords[compareToWord];
      const nextHaiku = haikus[i + 1];
      if (!nextHaiku || nextHaiku.length < 3) {
        outputLines.push(`<?> No haiku to evaluate after condition at lines ${i * 3 + 1}-${i * 3 + 3}`);
        continue;
      }
      if (memory[varName] > compareTo) {
        try {
          validateHaiku(nextHaiku, i + 1);
          interpretHaiku(nextHaiku, false, memory, outputLines);
        } catch (err) {
          outputLines.push(err.message);
        }
      }
      skipNext = true;
      continue;
    }
    let rhymed = false;
    if (rhymes(haiku[0], haiku[2]) || rhymes(haiku[1], haiku[2]) || rhymes(haiku[0], haiku[1])) {
      rhymed = true;
    }
    const hasPalindrome = hasPalindromeWord(haiku);
    try {
      validateHaiku(haiku, i);
      if (hasPalindrome) {
        outputLines.push(`🧚🏼 Palindrome detected! Reversing haiku:`);
        const reverseWords = line => line.split(' ').reverse().join(' ');
        outputLines.push(reverseWords(haiku[2]));
        outputLines.push(reverseWords(haiku[1]));
        outputLines.push(reverseWords(haiku[0]));
      }
      interpretHaiku(haiku, rhymed, memory, outputLines);
    } catch (err) {
      outputLines.push(err.message);
    }
  }
  return outputLines.join('\n');
}
