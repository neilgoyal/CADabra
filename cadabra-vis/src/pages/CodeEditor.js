// src/components/CodeEditor.js

import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import axios from 'axios';
import { EditorContainer, SaveButton } from '../ss.js';
import { kittyCadLanguage } from './kittyCadLanguage.js';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('kittyCad');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const monaco = useMonaco();

  // Register the custom language and define the theme
  useEffect(() => {
    if (monaco) {
      // Register the language
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'kittyCad')) {
        monaco.languages.register(kittyCadLanguage);

        // Set the language's tokenizer
        monaco.languages.setMonarchTokensProvider('kittyCad', kittyCadLanguage.tokenizer);

        // Set the language configuration
        monaco.languages.setLanguageConfiguration('kittyCad', kittyCadLanguage.languageConfiguration);

        // Define a custom theme
        monaco.editor.defineTheme('kittyCadTheme', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
            { token: 'operator', foreground: 'D4D4D4' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'identifier', foreground: '9CDCFE' },
            { token: 'brackets', foreground: 'D4D4D4' },
          ],
          colors: {
            'editor.background': '#1E1E1E',
          },
        });

        // Apply the theme
        monaco.editor.setTheme('kittyCadTheme');
      }
    }
  }, [monaco]);

  // Fetch the code from the backend when the component mounts
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await axios.get('/api/codefile');
        setCode(response.data.code);
        setLanguage(response.data.language || 'kittyCad');
      } catch (error) {
        console.error('Error fetching code:', error);
        alert('Failed to load code.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCode();
  }, []);

  // Handle changes in the editor
  const handleEditorChange = (value) => {
    setCode(value);
  };

  // Handle saving the code
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/codefile', { code });
      alert('Code saved successfully!');
    } catch (error) {
      console.error('Error saving code:', error);
      alert('Failed to save code.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditorContainer>
      <SaveButton onClick={handleSave} disabled={isSaving || isLoading}>
        {isSaving ? 'Saving...' : 'Save'}
      </SaveButton>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="kittyCadTheme"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      )}
    </EditorContainer>
  );
};

export default CodeEditor;




// import React, { useState, useEffect } from 'react';
// import Editor from '@monaco-editor/react';
// import axios from 'axios';
// import { EditorContainer, SaveButton } from '../ss.js';

// const CodeEditor = () => {
//   const [code, setCode] = useState('');
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     // Fetch the code from the backend
//     const fetchCode = async () => {
//       try {
//         const response = await axios.get('/api/codefile');
//         setCode(response.data.code);
//       } catch (error) {
//         console.error('Error fetching code:', error);
//         alert('Failed to load code.');
//       }
//     };

//     fetchCode();
//   }, []);

//   const handleEditorChange = (value) => {
//     setCode(value);
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       await axios.post('/api/codefile', { code });
//       alert('Code saved successfully!');
//     } catch (error) {
//       console.error('Error saving code:', error);
//       alert('Failed to save code.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleEditorWillMount = (monaco) => {
//     // Register a new language
//     monaco.languages.register({ id: 'kittycad' });

//     // Define the language's syntax
//     monaco.languages.setMonarchTokensProvider('kittycad', {
//       tokenizer: {
//         root: [
//           // Define syntax rules here
//           [/\b(if|else|for|while|return)\b/, 'keyword'],
//           [/[a-z_$][\w$]*/, 'identifier'],
//           [/\d+/, 'number'],
//           [/[{}()\[\]]/, '@brackets'],
//           [/[;,.]/, 'delimiter'],
//           [/".*?"/, 'string'],
//           [/'[^']*'/, 'string'],
//           [/#.*/, 'comment'],
//         ],
//       },
//     });

//     // Optionally set language configuration
//     monaco.languages.setLanguageConfiguration('kittycad', {
//       comments: {
//         lineComment: '#',
//       },
//       brackets: [
//         ['{', '}'],
//         ['[', ']'],
//         ['(', ')'],
//       ],
//       autoClosingPairs: [
//         { open: '{', close: '}' },
//         { open: '[', close: ']' },
//         { open: '(', close: ')' },
//         { open: '"', close: '"' },
//         { open: "'", close: "'" },
//       ],
//     });
//   };

//   return (
//     <EditorContainer>
//       <SaveButton onClick={handleSave} disabled={isSaving}>
//         {isSaving ? 'Saving...' : 'Save'}
//       </SaveButton>
//       <Editor
//         height="100%"
//         width="100%"
//         defaultLanguage="kittycad"
//         value={code}
//         onChange={handleEditorChange}
//         theme="vs-dark"
//         beforeMount={handleEditorWillMount} // Use beforeMount to register language
//         options={{ fontSize: 14 }}
//       />
//     </EditorContainer>
//   );
// };

// export default CodeEditor;
