import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  ChatContainer,
  MessagesContainer,
  MessageRow,
  MessageBubble,
  InputContainer,
  InputField,
  SendButton,
  ProfileIcon,
} from '../ss.js';
import { FaUserCircle, FaPaperclip } from 'react-icons/fa';
import { FaWandMagicSparkles } from "react-icons/fa6";

const Chat = () => {
  const [messages, setMessages] = useState([{ text: 'Hello! How can I assist you today?', isUser: false }]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]); // Track attached files
  const fileInputRef = useRef(null);

  // Handle file attachment button click
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection and automatically upload files
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]); // Add files to attached files list
    e.target.value = null; // Reset file input

    for (const file of files) {
      let endpoint = '';
      let formData = new FormData();

      // Determine the appropriate endpoint based on file type
      if (file.type.startsWith('video/')) {
        endpoint = 'http://localhost:4500/videoUpload';
        formData.append('video_file', file);
      } else if (file.type.startsWith('image/')) {
        endpoint = 'http://localhost:4500/imageUpload';
        formData.append('image_file', file);
      } else if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
        endpoint = 'http://localhost:4500/audioUpload';
        formData.append('mp3_file', file);
      } else if (file.name.endsWith('.stl')) { // Handling STL files
        endpoint = 'http://localhost:4500/stlUpload';
        formData.append('stl_file', file);
      } else {
        setMessages((prev) => [...prev, { text: 'Unsupported file type.', isUser: false }]);
        continue;
      }

      try {
        // Upload file to the server
        const response = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        // Handle server response if needed
        let serverMessage = { text: response.data.message || 'File processed.', isUser: false };
        
        // Display generated image link if STL file was uploaded and image was created
        if (endpoint === 'http://localhost:4500/stlUpload' && response.data.image_path) {
          serverMessage.imageUrl = response.data.image_path;
          serverMessage.text += ' Image generated successfully.';
        }
      } catch (error) {
      }
    }
  };

  // Function to send text messages only
  const sendMessage = async () => {
    if (!inputText.trim()) return; // Prevent sending empty messages

    const newMessage = { text: inputText, isUser: true };
    setMessages([...messages, newMessage]);
    setInputText('');

    try {
      // Send text message to the server
      const response = await axios.post('http://localhost:4500/api/chat', { message: inputText });
      const botReply = { text: response.data.reply, isUser: false };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: 'Sorry, something went wrong.', isUser: false }]);
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, idx) => (
          <MessageRow key={idx} isUser={msg.isUser}>
            {!msg.isUser && <ProfileIcon as={FaWandMagicSparkles} color="white" />}
            <MessageBubble isUser={msg.isUser}>
              {msg.text}
              {/* Display image if STL image was generated */}
              {msg.imageUrl && (
                <div style={{ marginTop: '8px' }}>
                  <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                    View Generated Image
                  </a>
                </div>
              )}
            </MessageBubble>
            {msg.isUser && <ProfileIcon as={FaUserCircle} color="white" />}
          </MessageRow>
        ))}
      </MessagesContainer>
      <InputContainer>
        {/* Display attached files */}
        {attachedFiles.length > 0 && (
          <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column' }}>
            {attachedFiles.map((file, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleAttachClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#555' }} aria-label="Attach File">
          <FaPaperclip />
        </button>
        <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
        <InputField type="text" placeholder="Type your message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
