const problematic = {
  abalone: 4, abare: 3, abbruzzese: 4, abed: 2, aborigine: 5, abruzzese: 4,
  acreage: 3, adame: 3, adieu: 2, adobe: 3, anemone: 4, anyone: 3, apache: 3,
  aphrodite: 4, apostrophe: 4, ariadne: 4, cafe: 2, calliope: 4, catastrophe: 4,
  chile: 2, chloe: 2, circe: 2, coyote: 3, daphne: 2, epitome: 4, eurydice: 4,
  euterpe: 3, every: 2, everywhere: 3, forever: 3, gethsemane: 4, guacamole: 4,
  hermione: 4, hyperbole: 4, jesse: 2, jukebox: 2, karate: 3, machete: 3,
  maybe: 2, naive: 2, newlywed: 3, penelope: 4, people: 2, persephone: 4,
  phoebe: 2, pulse: 1, queue: 1, recipe: 3, riverbed: 3, sesame: 3,
  shoreline: 2, simile: 3, snuffleupagus: 5, sometimes: 2, syncope: 3,
  tamale: 3, waterbed: 3, wednesday: 2, yosemite: 4, zoe: 2
};

const own = {}.hasOwnProperty;
const EXPRESSION_MONOSYLLABIC_ONE = new RegExp(
  [
    'awe($|d|so)', 'cia(?:l|$)', 'tia', 'cius', 'cious', '[^aeiou]giu',
    '[aeiouy][^aeiouy]ion', 'iou', 'sia$', 'eous$', '[oa]gue$',
    '.[^aeiuoycgltdb]{2,}ed$', '.ely$', '^jua', 'uai', 'eau', '^busi$',
    '(?:[aeiouy](?:' + [
      '[bcfgklmnprsvwxyz]', 'ch', 'dg', 'g[hn]', 'lch', 'l[lv]', 'mm',
      'nch', 'n[cgn]', 'r[bcnsv]', 'squ', 's[chkls]', 'th'
    ].join('|') + ')ed$)',
    '(?:[aeiouy](?:' + [
      '[bdfklmnprstvy]', 'ch', 'g[hn]', 'lch', 'l[lv]', 'mm', 'nch',
      'nn', 'r[nsv]', 'squ', 's[cklst]', 'th'
    ].join('|') + ')es$)'
  ].join('|'), 'g'
);

const EXPRESSION_MONOSYLLABIC_TWO = new RegExp(
  '[aeiouy](?:' + [
    '[bcdfgklmnprstvyz]', 'ch', 'dg', 'g[hn]', 'l[lv]', 'mm', 'n[cgns]',
    'r[cnsv]', 'squ', 's[cklst]', 'th'
  ].join('|') + ')e$', 'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_ONE = new RegExp(
  '(?:' + [
    '([^aeiouy])\\1l', '[^aeiouy]ie(?:r|s?t)', '[aeiouym]bl', 'eo', 'ism',
    'asm', 'thm', 'dnt', 'snt', 'uity', 'dea', 'gean', 'oa', 'ua', 'react?',
    'orbed', 'shred', 'eings?', '[aeiouy]sh?e[rs]'
  ].join('|') + ')$', 'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_TWO = new RegExp(
  [
    'creat(?!u)', '[^gq]ua[^auieo]', '[aeiou]{3}', '^(?:ia|mc|coa[dglx].)',
    '^re(app|es|im|us)', '(th|d)eist'
  ].join('|'), 'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_THREE = new RegExp(
  [
    '[^aeiou]y[ae]', '[^l]lien', 'riet', 'dien', 'iu', 'io', 'ii', 'uen',
    '[aeilotu]real', 'real[aeilotu]', 'iell', 'eo[^aeiou]', '[aeiou]y[aeiou]'
  ].join('|'), 'g'
);

const EXPRESSION_DOUBLE_SYLLABIC_FOUR = /[^s]ia/;

const EXPRESSION_SINGLE = new RegExp(
  [
    '^(?:' + [
      'un', 'fore', 'ware', 'none?', 'out', 'post', 'sub', 'pre', 'pro',
      'dis', 'side', 'some'
    ].join('|') + ')',
    '(?:' + [
      'ly', 'less', 'some', 'ful', 'ers?', 'ness', 'cians?', 'ments?',
      'ettes?', 'villes?', 'ships?', 'sides?', 'ports?', 'shires?',
      '[gnst]ion(?:ed|s)?'
    ].join('|') + ')$'
  ].join('|'), 'g'
);

const EXPRESSION_DOUBLE = new RegExp(
  [
    '^' + '(?:' + [
      'above', 'anti', 'ante', 'counter', 'hyper', 'afore', 'agri', 'infra',
      'intra', 'inter', 'over', 'semi', 'ultra', 'under', 'extra', 'dia',
      'micro', 'mega', 'kilo', 'pico', 'nano', 'macro', 'somer'
    ].join('|') + ')',
    '(?:fully|berry|woman|women|edly|union|((?:[bcdfghjklmnpqrstvwxz])|[aeiou])ye?ing)$'
  ].join('|'), 'g'
);

const EXPRESSION_TRIPLE = /(creations?|ology|ologist|onomy|onomist)$/g;

function pluralize(word, count) {
  if (count === 1) {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }
  return word;
}

function normalize(str) {
  return str.normalize ? str.normalize() : str;
}

function one(value) {
  let count = 0;

  if (value.length === 0) {
    return count;
  }

  if (value.length < 3) {
    return 1;
  }

  if (own.call(problematic, value)) {
    return problematic[value];
  }

  const singular = pluralize(value, 1);

  if (own.call(problematic, singular)) {
    return problematic[singular];
  }

  const addOne = returnFactory(1);
  const subtractOne = returnFactory(-1);

  value = value
    .replace(EXPRESSION_TRIPLE, countFactory(3))
    .replace(EXPRESSION_DOUBLE, countFactory(2))
    .replace(EXPRESSION_SINGLE, countFactory(1));

  const parts = value.split(/[^aeiouy]+/);
  let index = -1;

  while (++index < parts.length) {
    if (parts[index] !== '') {
      count++;
    }
  }

  value
    .replace(EXPRESSION_MONOSYLLABIC_ONE, subtractOne)
    .replace(EXPRESSION_MONOSYLLABIC_TWO, subtractOne);

  value
    .replace(EXPRESSION_DOUBLE_SYLLABIC_ONE, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_TWO, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_THREE, addOne)
    .replace(EXPRESSION_DOUBLE_SYLLABIC_FOUR, addOne);

  return count || 1;

  function countFactory(addition) {
    return counter;
    function counter() {
      count += addition;
      return '';
    }
  }

  function returnFactory(addition) {
    return returner;
    function returner($0) {
      count += addition;
      return $0;
    }
  }
}

function syllable(value) {
  const values = normalize(String(value))
    .toLowerCase()
    .replace(/['']/g, '')
    .split(/\b/g);
  let index = -1;
  let sum = 0;

  while (++index < values.length) {
    sum += one(values[index].replace(/[^a-z]/g, ''));
  }

  return sum;
}

window.syllable = syllable; 