import React, { useState } from 'react';
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
import { FaUserCircle, FaRobot } from 'react-icons/fa';
import { FaWandMagicSparkles } from "react-icons/fa6";


const Chat = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = { text: inputText, isUser: true };
    setMessages([...messages, newMessage]);
    setInputText('');

    try {
      const response = await axios.post('/api/chat', { message: inputText });
      const botReply = { text: response.data.reply, isUser: false };
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
            <MessageBubble isUser={msg.isUser}>{msg.text}</MessageBubble>
            {msg.isUser && <ProfileIcon as={FaUserCircle} isUser={msg.isUser}  color="white" />}
          </MessageRow>
        ))}
      </MessagesContainer>
      <InputContainer>
        <InputField
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;


