
export const kittyCadLanguage = {
  id: 'kittyCad',

  // Define the tokenizer
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/[^#\s]+/, 'string'],
      [/#.*$/, 'comment'],
    ],
  },

  // Define keywords
  keywords: [
    'define',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'break',
    'continue',
    // Add more keywords as per your language
  ],

  // Define brackets
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],

  // Define symbols
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Define comments
  comments: {
    lineComment: '#',
  },

  // Define auto closing pairs
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  // Define surrounding pairs
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};
