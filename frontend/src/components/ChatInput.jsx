
import React from 'react';
import styled from 'styled-components';

const ChatInput = ({ input, setInput, sendMessage, loading, disabled }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <InputContainer>
      <StyledInput 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask the Council..."
      />
      <SendButton onClick={sendMessage} disabled={disabled || loading}>
        {loading ? 'Sending...' : 'Send'}
      </SendButton>
    </InputContainer>
  );
};

const InputContainer = styled.div`
  padding: 20px 15%;
  background: transparent; /* allow gradient to show */
  display: flex;
  gap: 15px;
  position: relative;
  z-index: 30;

  @media (max-width: 768px) {
    padding: 15px;
    gap: 10px;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 30px;
  color: white;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    font-size: 16px; /* Prevents auto-zoom on iOS */
    padding: 14px 20px;
  }
  
  &:focus {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 0 32px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
    filter: brightness(1.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #334155;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export default ChatInput;
