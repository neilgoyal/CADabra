import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { SaveButton } from '../ss';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [schemas, setSchemas] = useState([]);

  // Setup Monaco configurations before mount
  const handleBeforeMount = (monaco) => {
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'kittyCad')) {
      monaco.languages.register({ id: 'kittyCad' });

      monaco.languages.setMonarchTokensProvider('kittyCad', {
        tokenizer: {
          root: [
            [/\b(if|else|for|while|return)\b/, 'keyword'],
            [/\b\d+\b/, 'number'],
            [/[{}()\[\]]/, '@brackets'],
            [/[=+\-*/%<>!]+/, 'operator'], // Define operators
            [/\b\w+\b(?=\()/, 'function'], // Function names before '('
            [/\b\w+\b/, 'variable'], // Variables
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            [/#.*$/, 'comment'], // '#' comments
            [/\/\/.*$/, 'comment'], // '//' comments
          ],
        },
      });

      
      // // Define the tokenizer
      // monaco.languages.setMonarchTokensProvider('kittyCad', {
      //   tokenizer: {
      //     root: [
      //       [/\b(if|else|for|while|return)\b/, 'keyword'],
      //       [/\b\d+\b/, 'number'],
      //       [/[{}()\[\]]/, '@brackets'],
      //       [/"[^"]*"/, 'string'],
      //       [/'[^']*'/, 'string'],
      //       [/#.*$/, 'comment'],
      //     ],
      //   },
      // });

      // Define the theme
      // monaco.editor.defineTheme('kittyCadTheme', {
      //   base: 'vs-dark',
      //   inherit: false,
      //   rules: [
      //     { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
      //     { token: 'number', foreground: 'B5CEA8' },
      //     { token: 'string', foreground: 'CE9178' },
      //     { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      //     { token: 'bracket', foreground: 'D4D4D4' },
      //   ],
      //   colors: {
      //     'editor.background': '#1E1E1E',
      //     'editor.foreground': '#D4D4D4',
      //     'editorCursor.foreground': '#AEAFAD',
      //     'editor.lineHighlightBackground': '#2A2D2E',
      //     'editorLineNumber.foreground': '#858585',
      //     'editor.selectionBackground': '#264F78',
      //     'editor.inactiveSelectionBackground': '#3A3D41',
      //     'editorBracketMatch.background': '#264F78',
      //     'editorBracketMatch.border': '#C586C0',
      //     'editorWhitespace.foreground': '#404040',
      //     'editorIndentGuide.background': '#404040',
      //     'editorIndentGuide.activeBackground': '#707070',

      //   },
      // });

      // In CodeEditor.js, update the theme rules
      monaco.editor.defineTheme('kittyCadTheme', {
        base: 'vs-dark',
        inherit: false,
        rules: [
          { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'brackets', foreground: 'D4D4D4' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'identifier', foreground: 'FFFFFF' }, // Add this line
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editorCursor.foreground': '#AEAFAD',
          'editor.lineHighlightBackground': '#2A2D2E',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editorBracketMatch.background': '#264F78',
          'editorBracketMatch.border': '#C586C0',
          'editorWhitespace.foreground': '#404040',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070',
        },
      });

      monaco.editor.setTheme('kittyCadTheme');
      


    

    }
  };

  // Load content from my-file.kcl and update schemas when dependencies change
  useEffect(() => {
    // Load file content from public/assets/my-file.kcl
    const loadFileContent = async () => {
      try {
        const response = await fetch('/assets/my-file.kcl');
        if (response.ok) {
          const text = await response.text();
          setCode(text); // Set loaded content as the initial editor value
        } else {
          console.error('Failed to load file: ', response.statusText);
        }
      } catch (error) {
        console.error('Error loading file:', error);
      }
    };

    loadFileContent();

    const fetchSchemas = async () => {
      const newSchemas = await fetchSchemasFromSource();
      setSchemas(newSchemas);
    };

    fetchSchemas();

    if (schemas.length) {
      console.log("Schemas updated:", schemas);
    }
  }, [schemas]);

  return (
    <>
    <Editor
      height="100%"
      width="100%"
      language="kittyCad"
      theme="kittyCadTheme"
      value={code}
      onChange={setCode}
      beforeMount={handleBeforeMount}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
      }}
    />
    </>
  );
};

// Example async function to fetch schemas
async function fetchSchemasFromSource() {
  return [
    { uri: 'http://my-schema/kittyCad', schema: { /* define schema properties here */ } }
  ];
}

export default CodeEditor;
