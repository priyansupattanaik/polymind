import React, { useState } from 'react';
import styled from 'styled-components';
import Background from './components/Background';
import Loader from './components/Loader';
import Header from './components/Header';
import ModelSelector from './components/ModelSelector';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import ErrorBoundary from './components/ErrorBoundary';
import { useChat } from './hooks/useChat';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    activeModels,
    availableModels,
    messages,
    input,
    loading,
    messageListRef,
    setInput,
    toggleModel,
    sendMessage
  } = useChat();

  return (
    <>
      <Background />
      <AppContainer>
        <Header onOpenModal={() => setIsModalOpen(true)} />

        <ModelSelector 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableModels={availableModels}
          activeModels={activeModels}
          toggleModel={toggleModel}
        />

        <ChatArea>
          <MessageList ref={messageListRef}>
            {messages.map((msg, idx) => (
              <MessageGroup key={idx} $isUser={msg.role === 'user'}>
                <ErrorBoundary>
                  <MessageBubble content={msg.content} isUser={msg.role === 'user'} />
                </ErrorBoundary>
                {msg.role === 'assistant' && (
                  <MessageFooter>
                    <ChairmanBadge>Synthesized by: {msg.chairman || 'Council Chairman'}</ChairmanBadge>
                    {msg.individual_responses && msg.individual_responses.length > 0 && (
                      <DeliberationAccordion>
                        <summary>View Council Deliberation ({msg.individual_responses.length} Models)</summary>
                        <SourcesList>
                          {msg.individual_responses.map((resp, i) => (
                            <SourceItem key={i}>
                              <SourceHeader>{resp.name}</SourceHeader>
                              <SourceContent>{resp.content}</SourceContent>
                            </SourceItem>
                          ))}
                        </SourcesList>
                      </DeliberationAccordion>
                    )}
                  </MessageFooter>
                )}
              </MessageGroup>
            ))}
            
            {loading && (
              <LoaderContainer>
                <Loader />
                <LoadingText>The Council is deliberating...</LoadingText>
              </LoaderContainer>
            )}
          </MessageList>

          <ChatInput 
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loading={loading}
            disabled={activeModels.length === 0}
          />
        </ChatArea>
      </AppContainer>
    </>
  );
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  color: white;
  position: relative;
  z-index: 10;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at 50% 50%, rgba(10, 20, 40, 0.4), rgba(0, 0, 0, 0.8));
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden; /* Critical for preventing ChatArea from growing beyond 100vh */
  position: relative;
`;

const MessageList = styled.div`
  flex: 1;
  min-height: 0; /* Critical for nested flex scrolling */
  padding: 20px 15%; /* Centered content on desktop */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-behavior: smooth;

  @media (max-width: 768px) {
    padding: 20px 15px;
  }
  
  /* Hide scrollbar for cleaner look, but keep functionality */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  max-width: ${props => props.$isUser ? '70%' : '85%'};
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);

  @keyframes slideIn {
    to { opacity: 1; transform: translateY(0); }
  }
`;

const MessageFooter = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
`;

const ChairmanBadge = styled.div`
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
  align-self: flex-start;
`;

const DeliberationAccordion = styled.details`
  font-size: 0.85rem;
  color: #aaa;
  
  summary {
    cursor: pointer;
    margin-bottom: 10px;
    padding: 5px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    user-select: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const SourcesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid rgba(255,255,255,0.1);
`;

const SourceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SourceHeader = styled.div`
  font-weight: bold;
  color: #2196F3;
  font-size: 0.8rem;
`;

const SourceContent = styled.div`
  white-space: pre-wrap;
  font-size: 0.85rem;
  color: #ddd;
  background: rgba(0,0,0,0.2);
  padding: 8px;
  border-radius: 4px;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  gap: 20px;
`;

const LoadingText = styled.span`
  color: #aaa;
  font-size: 0.9rem;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;

export default App;