import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Background from './components/Background';
import Loader from './components/Loader';
import Switch from './components/Switch';

// Council Members Configuration (Must match Backend IDs)
const AVAILABLE_MODELS = [
  { id: 'groq-qwen', name: 'Qwen 3 32B (Groq)' },
  { id: 'groq-llama8b', name: 'Llama 3.1 8B (Groq)' },
  { id: 'groq-llama17b', name: 'Llama 4 Scout (Groq)' },
  { id: 'groq-kimi', name: 'Kimi K2 (Groq)' },
  { id: 'groq-gptoss', name: 'GPT OSS 120B (Groq)' },
  { id: 'nvidia-minimax', name: 'Minimax M2.1 (Nvidia)' },
  { id: 'nvidia-step', name: 'Step 3.5 Flash (Nvidia)' },
  { id: 'nvidia-mistral', name: 'Devstral 123B (Nvidia)' },
];

function App() {
  const [activeModels, setActiveModels] = useState(AVAILABLE_MODELS.map(m => m.id));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleModel = (id) => {
    setActiveModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Connect to the backend API we built in Phase 1
      const response = await axios.post('http://localhost:8000/api/council', {
        prompt: userMessage.content,
        active_models: activeModels
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.unified_response,
        details: response.data.individual_responses
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with council:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "The Council is currently unavailable. Please check the backend connection." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Background />
      <AppContainer>
        <Sidebar>
          <Title>PolyMind Council</Title>
          <Subtitle>Active Members</Subtitle>
          <ModelList>
            {AVAILABLE_MODELS.map(model => (
              <ModelItem key={model.id}>
                <Switch 
                  isOn={activeModels.includes(model.id)} 
                  handleToggle={() => toggleModel(model.id)} 
                />
                <ModelName>{model.name}</ModelName>
              </ModelItem>
            ))}
          </ModelList>
        </Sidebar>

        <ChatArea>
          <MessageList>
            {messages.map((msg, idx) => (
              <MessageGroup key={idx} isUser={msg.role === 'user'}>
                <Bubble isUser={msg.role === 'user'}>
                  {msg.content}
                </Bubble>
                
                {/* Display Individual Council Opinions if available */}
                {msg.details && (
                  <DetailsContainer>
                    <DetailsSummary>Council Perspectives:</DetailsSummary>
                    <Grid>
                      {Object.entries(msg.details).map(([name, response]) => (
                        <MiniCard key={name}>
                          <strong>{name}:</strong> {response.slice(0, 150)}...
                        </MiniCard>
                      ))}
                    </Grid>
                  </DetailsContainer>
                )}
              </MessageGroup>
            ))}
            
            {loading && (
              <LoaderContainer>
                <Loader />
                <LoadingText>The Council is deliberating...</LoadingText>
              </LoaderContainer>
            )}
            <div ref={messagesEndRef} />
          </MessageList>

          <InputContainer>
            <StyledInput 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the Council..."
            />
            <SendButton onClick={sendMessage} disabled={loading || activeModels.length === 0}>
              Example
            </SendButton>
          </InputContainer>
        </ChatArea>
      </AppContainer>
    </>
  );
}

// Styled Components for Layout
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  color: white;
  position: relative;
  z-index: 10;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 5px;
  font-weight: bold;
  background: linear-gradient(to right, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.h3`
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ModelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModelItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 5px 10px;
  border-radius: 8px;
`;

const ModelName = styled.span`
  font-size: 0.9rem;
  margin-left: 10px;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const Bubble = styled.div`
  background: ${props => props.isUser ? '#2196F3' : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(5px);
  padding: 15px 20px;
  border-radius: 15px;
  border-bottom-right-radius: ${props => props.isUser ? '2px' : '15px'};
  border-bottom-left-radius: ${props => props.isUser ? '15px' : '2px'};
  line-height: 1.5;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const DetailsContainer = styled.div`
  margin-top: 10px;
  width: 100%;
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  font-size: 0.8rem;
`;

const DetailsSummary = styled.div`
  margin-bottom: 8px;
  color: #aaa;
  font-weight: bold;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const MiniCard = styled.div`
  background: rgba(255,255,255,0.05);
  padding: 8px;
  border-radius: 4px;
  color: #ddd;
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

const InputContainer = styled.div`
  padding: 20px 40px;
  background: rgba(0,0,0,0.8);
  display: flex;
  gap: 15px;
`;

const StyledInput = styled.input`
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 15px;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #2196F3;
    background: rgba(255,255,255,0.15);
  }
`;

const SendButton = styled.button`
  background: #2196F3;
  color: white;
  border: none;
  padding: 0 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #1976D2;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

export default App;