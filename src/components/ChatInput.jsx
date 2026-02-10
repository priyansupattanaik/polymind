import React from 'react';
import styled from 'styled-components';
import { Send, Sliders } from 'lucide-react';
import Switch from './Switch';

const ChatInput = ({ 
  input, 
  setInput, 
  sendMessage, 
  loading, 
  disabled, 
  dreamMode, 
  toggleDreamMode,
  openModelSelector,
  activeModelCount = 0
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <InputWrapper>
        <HudContainer $dreamMode={dreamMode}>
             {/* Model Selector Toggle */}
            <HudButton onClick={openModelSelector} title="Manage Council Models">
                <Sliders size={16} />
                <ToggleLabel>MODELS [{activeModelCount}]</ToggleLabel>
            </HudButton>

            <Divider />

            <DreamSwitchContainer title={dreamMode ? "Deactivate Dream Protocol" : "Activate Dream Protocol"}>
               <Switch checked={dreamMode} onChange={toggleDreamMode} />
               <ToggleLabel $active={dreamMode}>DREAM PROTOCOL</ToggleLabel>
            </DreamSwitchContainer>
            
            <Divider />
            
            <InputScanner>
              <StyledInput 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={dreamMode ? "SELECT DREAM SEQUENCE..." : (disabled ? "AWAITING MODEL SELECTION..." : "ENTER COMMAND...")}
                  disabled={disabled || loading}
                  maxLength={500}
                  $dreamMode={dreamMode}
              />
            </InputScanner>

            <SendButton onClick={sendMessage} disabled={disabled || loading || !input.trim()}>
                <Send size={18} />
                <SendLabel>EXEC</SendLabel>
            </SendButton>
        </HudContainer>
    </InputWrapper>
  );
};

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 20px;
`;

const HudContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 800px; /* Constrain width for HUD look */
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px; /* Fully rounded pill */
  padding: 8px 24px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(10, 10, 10, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  /* Optional: Subtle glow based on mode */
  ${props => props.$dreamMode && `
    border-color: rgba(250, 204, 21, 0.4);
    box-shadow: 0 0 30px rgba(250, 204, 21, 0.15);
  `}
`;

const HudButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-title);
  
  &:hover {
    color: var(--text-proj);
    background: rgba(255,255,255,0.05);
  }
`;

const DreamToggle = styled(HudButton)`
  color: ${props => props.$active ? 'var(--alert-red)' : 'var(--text-muted)'};
  background: ${props => props.$active ? 'rgba(210, 31, 60, 0.1)' : 'transparent'};
  
  &:hover {
    color: var(--accent-coral);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: var(--border-film);
`;

const ToggleLabel = styled.span`
  font-size: 0.75rem;
  letter-spacing: 1px;
  font-weight: 500;
  color: ${props => props.$active ? 'var(--text-proj)' : 'var(--text-muted)'};
  transition: color 0.3s;
  
  @media (max-width: 600px) {
    display: none;
  }
`;

const InputScanner = styled.div`
  flex: 1;
  padding: 0 16px;
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-proj);
  font-family: var(--font-main); /* Changed for better readability */
  font-size: 1rem;
  padding: 12px 0;
  outline: none;
  /* Removed text-transform: uppercase to handle normal text better */
  
  &::placeholder {
    color: var(--text-dim);
    opacity: 0.5;
  }
`;

const SendButton = styled.button`
  background: var(--text-proj);
  color: #000;
  border: none;
  height: 40px;
  padding: 0 16px;
  margin-right: 4px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--font-title);
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.2s;
  
  &:disabled {
    background: #333;
    color: #555;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background: var(--flare-blue);
    color: #fff;
    box-shadow: 0 0 15px var(--flare-blue);
  }
`;

const SendLabel = styled.span`
  font-size: 0.75rem;
`;

const DreamSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
`;

export default ChatInput;
