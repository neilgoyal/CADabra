import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { EditorContainer, SaveButton } from '../ss.js';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript'); // Adjust the language as needed

  useEffect(() => {
    // Fetch the code from the backend
    const fetchCode = async () => {
      try {
        const response = await axios.get('/api/codefile');
        setCode(response.data.code);
        setLanguage(response.data.language || 'javascript');
      } catch (error) {
        console.error('Error fetching code:', error);
      }
    };

    fetchCode();
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/codefile', { code });
      alert('Code saved successfully!');
    } catch (error) {
      console.error('Error saving code:', error);
      alert('Failed to save code.');
    }
  };

  return (
    <EditorContainer>
      <SaveButton onClick={handleSave}>Save</SaveButton>
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
      />
    </EditorContainer>
  );
};

export default CodeEditor;
