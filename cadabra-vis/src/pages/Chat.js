// import React, { useState } from 'react';
// import axios from 'axios';
// import {
//   ChatContainer,
//   MessagesContainer,
//   MessageRow,
//   MessageBubble,
//   InputContainer,
//   InputField,
//   SendButton,
//   ProfileIcon,
// } from '../ss.js';
// import { FaUserCircle, FaRobot } from 'react-icons/fa';
// import { FaWandMagicSparkles } from "react-icons/fa6";


// const Chat = () => {
//   const [messages, setMessages] = useState([
//     { text: 'Hello! How can I assist you today?', isUser: false },
//   ]);
//   const [inputText, setInputText] = useState('');

//   const sendMessage = async () => {
//     if (!inputText.trim()) return;

//     const newMessage = { text: inputText, isUser: true };
//     setMessages([...messages, newMessage]);
//     setInputText('');

//     try {
//       const response = await axios.post('/api/chat', { message: inputText });
//       const botReply = { text: response.data.reply, isUser: false };
//       setMessages((prev) => [...prev, botReply]);
//     } catch (error) {
//       console.error('Error:', error);
//       const errorMessage = {
//         text: 'Sorry, something went wrong.',
//         isUser: false,
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     }
//   };

//   return (
//     <ChatContainer>
//       <MessagesContainer>
//         {messages.map((msg, idx) => (
//           <MessageRow key={idx} isUser={msg.isUser}>
//             {!msg.isUser && <ProfileIcon as={FaWandMagicSparkles} isUser={msg.isUser} color="white" />}
//             <MessageBubble isUser={msg.isUser}>{msg.text}</MessageBubble>
//             {msg.isUser && <ProfileIcon as={FaUserCircle} isUser={msg.isUser}  color="white" />}
//           </MessageRow>
//         ))}
//       </MessagesContainer>
//       <InputContainer>
//         <InputField
//           type="text"
//           placeholder="Type your message..."
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//         />
//         <SendButton onClick={sendMessage}>Send</SendButton>
//       </InputContainer>
//     </ChatContainer>
//   );
// };

// export default Chat;


// src/components/Chat.js

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
  AttachButton, // Newly imported
  AttachedFilesContainer,
  AttachedFile,
  RemoveFileButton,
} from '../ss.js';
import { FaUserCircle, FaRobot, FaPaperclip } from 'react-icons/fa';
import { FaWandMagicSparkles } from "react-icons/fa6";

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Function to handle attachment button click
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
    // Clear the input value to allow re-uploading the same file if needed
    e.target.value = null;
  };

  // Function to remove an attached file
  const removeAttachedFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputText.trim() && attachedFiles.length === 0) return; // Prevent sending empty messages

    // Create a new message object
    const newMessage = { 
      text: inputText, 
      isUser: true,
      files: attachedFiles, // Include attached files
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setAttachedFiles([]); // Clear attached files after sending

    try {
      // Create FormData to send text and files
      const formData = new FormData();
      formData.append('message', inputText);
      attachedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await axios.post('/api/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const botReply = { 
        text: response.data.reply, 
        isUser: false,
        files: response.data.files || [], // Assuming the bot can send files too
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: 'Sorry, something went wrong.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, idx) => (
          <MessageRow key={idx} isUser={msg.isUser}>
            {!msg.isUser && <ProfileIcon as={FaWandMagicSparkles} isUser={msg.isUser} color="white" />}
            <MessageBubble isUser={msg.isUser}>
              {msg.text}
              {/* Display attached files if any */}
              {msg.files && msg.files.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {msg.files.map((file, fileIdx) => (
                    // Assuming files are URLs; if files are File objects, handle accordingly
                    <a 
                      key={fileIdx} 
                      href={file.url || URL.createObjectURL(file)} 
                      download={file.name}
                      style={{ display: 'block', color: '#3498db', textDecoration: 'underline' }}
                    >
                      {file.name}
                    </a>
                  ))}
                </div>
              )}
            </MessageBubble>
            {msg.isUser && <ProfileIcon as={FaUserCircle} isUser={msg.isUser}  color="white" />}
          </MessageRow>
        ))}
      </MessagesContainer>
      <InputContainer>
        {/* Attachment Button */}
        <button 
          onClick={handleAttachClick} 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 8px',
            fontSize: '20px',
            color: '#555',
          }}
          aria-label="Attach File"
        >
          <FaPaperclip />
        </button>

        {/* Hidden File Input */}
        <input 
          type="file" 
          multiple 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />

        {/* Display Attached Files */}
        {attachedFiles.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            maxHeight: '100px', 
            overflowY: 'auto', 
            marginLeft: '8px' 
          }}>
            {attachedFiles.map((file, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ marginRight: '8px' }}>{file.name}</span>
                <button 
                  onClick={() => removeAttachedFile(index)} 
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e74c3c',
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Field */}
        <InputField
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />

        {/* Send Button */}
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
