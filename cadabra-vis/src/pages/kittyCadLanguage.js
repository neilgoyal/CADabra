export const kittyCadLanguage = {
  id: 'kittyCad',

  // Define the tokenizer as an object
  tokenizer: {
    root: [
      [
        /[a-z_$][\w$]*/, 
        {
          cases: {
            '@keywords': 'keyword', // Matches defined keywords
            '@default': 'identifier',
          },
        },
      ],
      [/[{}()\[\]]/, '@brackets'], // Brackets to handle grouping symbols
      [/[<>](?!@symbols)/, '@brackets'], // Angular brackets for symbols
      [/[^#\s]+/, 'string'], // Strings not preceded by '#' or whitespace
      [/#.*$/, 'comment'], // Comment pattern with '#'
    ],
  },

  // Define keywords
  keywords: [
    'define', 'function', 'return', 'if', 'else', 'for', 'while', 'break', 'continue'
  ],

  // Use 'bracket' to handle pairs
  bracket: [
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

  // Define auto-closing and surrounding pairs
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

