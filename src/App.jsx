import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import Background from './components/Background';
import Loader from './components/Loader';
import Header from './components/Header';
import ModelSelector from './components/ModelSelector';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import ErrorBoundary from './components/ErrorBoundary';
import { useChat } from './hooks/useChat';
import { ChevronDown, ChevronRight, User, Bot } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    activeModels,
    availableModels,
    messages,
    input,
    loading,
    dreamMode,
    messageListRef,
    setInput,
    toggleModel,
    toggleDreamMode,
    sendMessage
  } = useChat();

  return (
    <>
      <Background />
      <AppLayout>
        <Header />

        <ModelSelector 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableModels={availableModels}
          activeModels={activeModels}
          toggleModel={toggleModel}
        />

        <MainDisplay>
          <ChatScrollArea ref={messageListRef}>
            <WelcomeMessage $visible={messages.length === 0}>
                <WelcomeTitle>POLY<span style={{color: 'var(--accent-cyan)'}}>MIND</span> COUNCIL</WelcomeTitle>
                <WelcomeSubtitle>INITIALIZE PROTOCOL. SELECT MODELS. BEGIN QUERY.</WelcomeSubtitle>
            </WelcomeMessage>

            {messages.map((msg, idx) => (
              <MessageGroup key={idx} $isUser={msg.role === 'user'}>
                {/* Avatar removed for screenplay layout */}
                
                <ContentWrapper>
                    <ErrorBoundary>
                    <MessageBubble content={msg.content} isUser={msg.role === 'user'} />
                    </ErrorBoundary>

                    {msg.role === 'assistant' && (
                    <MetaData>
                        <ChairmanInfo>
                            <span>SYNTHESIS BY: </span>
                            <ChairmanName>{msg.chairman || 'COUNCIL CHAIRMAN'}</ChairmanName>
                        </ChairmanInfo>
                        
                        {msg.individual_responses && msg.individual_responses.length > 0 && (
                        <DeliberationDetails>
                            <summary>
                                <ChevronRight size={14} className="icon-collapsed" />
                                <ChevronDown size={14} className="icon-expanded" />
                                VIEW DELIBERATION LOG ({msg.individual_responses.length})
                            </summary>
                            <DeliberationLog>
                            {msg.individual_responses.map((resp, i) => (
                                <LogEntry key={i}>
                                <LogHeader>{resp.name}</LogHeader>
                                <LogContent>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {resp.content || ''}
                                  </ReactMarkdown>
                                </LogContent>
                                </LogEntry>
                            ))}
                            </DeliberationLog>
                        </DeliberationDetails>
                        )}
                    </MetaData>
                    )}
                </ContentWrapper>
              </MessageGroup>
            ))}
            
            {loading && <Loader />}
          </ChatScrollArea>

          <InputArea>
            <ChatInput 
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                loading={loading}
                disabled={activeModels.length === 0}
                dreamMode={dreamMode}
                toggleDreamMode={toggleDreamMode}
                openModelSelector={() => setIsModalOpen(true)}
                activeModelCount={activeModels.length}
            />
          </InputArea>
        </MainDisplay>
      </AppLayout>
    </>
  );
}

// Styled Components
// Styled Components
const AppLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  
  /* Cinematic Vignette Overlay via CSS */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at center, transparent 50%, #000 150%);
    pointer-events: none;
    z-index: 10;
  }
`;

const MainDisplay = styled.main`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  height: 100%; /* Ensure full height usage */
  overflow: hidden; /* Prevent main container scroll */
`;

const ChatScrollArea = styled.div`
  flex: 1;
  width: 100%;
  max-width: var(--stage-width);
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin-top: 15vh;
  margin-bottom: 40px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? 0 : '20px'});
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
`;

const WelcomeTitle = styled.h1`
  font-family: var(--font-title);
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 8px;
  text-transform: uppercase;
  margin: 0;
  background: linear-gradient(to bottom, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));

  @media (max-width: 768px) {
    font-size: 3rem;
    letter-spacing: 4px;
  }
  @media (max-width: 480px) {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-family: var(--font-script);
  font-size: 0.9rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-top: 16px;
  text-transform: uppercase;
  opacity: 0.7;
  
  &::before, &::after {
    content: '-';
    margin: 0 10px;
    color: var(--cinema-gold);
  }
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 0; /* No gap needed for script layout */
  margin-bottom: 32px;
  width: 100%;
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const InputArea = styled.div`
  width: 100%;
  max-width: var(--stage-width);
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 0 0 30px 0;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 600px) {
    padding: 0 0 16px 0;
  }
`;

// Metadata and logs - Styled to look like Technical Specs
const MetaData = styled.div`
  margin-top: 8px;
  margin-left: 16px; 
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChairmanInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-script);
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ChairmanName = styled.span`
  color: var(--flare-blue);
  font-weight: 700;
`;

const DeliberationDetails = styled.details`
  font-size: 0.75rem;
  color: var(--text-muted);
  
  summary {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    transition: color 0.2s;
    font-family: var(--font-script);
    letter-spacing: 0.5px;
    
    &:hover {
      color: var(--text-proj);
    }
    
    &::marker {
      display: none;
    }
  }

  &[open] summary {
    margin-bottom: 12px;
    color: var(--text-proj);
  }

  .icon-expanded { display: none; }
  &[open] .icon-expanded { display: block; }
  &[open] .icon-collapsed { display: none; }
`;

const DeliberationLog = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
`;

const LogEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LogHeader = styled.div`
  font-family: var(--font-title);
  font-size: 0.7rem;
  color: var(--cinema-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const LogContent = styled.div`
  font-family: var(--font-script);
  font-size: 0.8rem;
  color: #aaa;
  line-height: 1.6;

  p { margin: 0.4em 0; }
  p:first-child { margin-top: 0; }
  p:last-child { margin-bottom: 0; }

  ul, ol {
    margin: 0.4em 0;
    padding-left: 1.4em;
  }

  li { margin-bottom: 0.2em; }

  code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 0.85em;
  }

  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5em 0;
    code {
      background: none;
      padding: 0;
    }
  }

  h1, h2, h3, h4 {
    color: var(--text-proj);
    font-family: var(--font-header);
    margin: 0.6em 0 0.3em;
    font-size: 0.9rem;
  }

  strong { color: var(--text-proj); }

  blockquote {
    border-left: 2px solid var(--cinema-gold);
    padding-left: 10px;
    margin: 0.4em 0;
    color: #999;
    font-style: italic;
  }

  a {
    color: var(--flare-blue);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.5em 0;
    font-size: 0.85em;
  }
  th, td {
    padding: 4px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: left;
  }
  th {
    background: rgba(255, 255, 255, 0.05);
    color: var(--cinema-gold);
    font-weight: 600;
  }
`;

export default App;