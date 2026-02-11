import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Send, Sliders, Sparkles } from 'lucide-react';
import Switch from './Switch';

const MAX_CHARS = 500;

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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const charCount = input.length;
  const charPercent = (charCount / MAX_CHARS) * 100;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && input.trim()) {
        sendMessage();
      }
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInput(value);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  return (
    <InputWrapper>
      <Container $focused={isFocused} $dreamMode={dreamMode}>
        {/* Input Row */}
        <InputRow>
          <TextArea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={dreamMode ? "Describe your dream..." : (disabled ? "Select models to begin..." : "Ask the council...")}
            disabled={disabled || loading}
            rows={1}
            $dreamMode={dreamMode}
          />
          <SendBtn 
            onClick={sendMessage} 
            disabled={disabled || loading || !input.trim()}
            $hasInput={input.trim().length > 0}
            title="Send"
          >
            <SendIconWrap $loading={loading}>
              <Send size={18} />
            </SendIconWrap>
          </SendBtn>
        </InputRow>

        {/* Bottom Controls */}
        <ControlsRow>
          <LeftControls>
            <ControlBtn onClick={openModelSelector} title="Manage Council Models">
              <Sliders size={14} />
              <ControlLabel>MODELS</ControlLabel>
              <CountBadge $active={activeModelCount > 0}>{activeModelCount}</CountBadge>
            </ControlBtn>

            <ControlDivider />

            <DreamControl title={dreamMode ? "Deactivate Dream Protocol" : "Activate Dream Protocol"}>
              <Sparkles size={14} style={{ color: dreamMode ? 'var(--cinema-gold)' : 'inherit' }} />
              <ControlLabel $active={dreamMode}>DREAM</ControlLabel>
              <Switch checked={dreamMode} onChange={toggleDreamMode} />
            </DreamControl>
          </LeftControls>

          <CharCounter $percent={charPercent} $near={charPercent > 80}>
            {charCount}/{MAX_CHARS}
          </CharCounter>
        </ControlsRow>

        {/* Focus glow line */}
        <GlowLine $visible={isFocused} $dreamMode={dreamMode} />
      </Container>
    </InputWrapper>
  );
};

// Animations
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const spinSend = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 720px;
  background: rgba(12, 12, 12, 0.75);
  border: 1px solid ${props => props.$focused ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 20px;
  padding: 14px 16px 10px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.$focused && css`
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  `}

  ${props => props.$dreamMode && css`
    border-color: rgba(212, 175, 55, 0.3);
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.08);
  `}

  @media (max-width: 480px) {
    border-radius: 16px;
    padding: 10px 12px 8px;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-proj);
  font-family: var(--font-main);
  font-size: 16px;
  line-height: 1.5;
  padding: 4px 2px;
  outline: none;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  /* Prevent iOS zoom on focus */
  -webkit-appearance: none;
  border-radius: 0;

  &::placeholder {
    color: var(--text-dim);
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  &:focus::placeholder {
    opacity: 0.3;
  }
`;

const SendBtn = styled.button`
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.$hasInput && !props.disabled ? 'var(--text-proj)' : 'rgba(255, 255, 255, 0.06)'};
  color: ${props => props.$hasInput && !props.disabled ? '#000' : 'var(--text-dim)'};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:not(:disabled):hover {
    background: var(--flare-blue);
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 0 16px rgba(0, 168, 232, 0.3);
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }
`;

const SendIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.$loading && css`
    animation: ${spinSend} 1s linear infinite;
  `}
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ControlBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-main);

  &:hover {
    color: var(--text-proj);
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 480px) {
    padding: 4px 6px;
    gap: 4px;
  }
`;

const DreamControl = styled(ControlBtn)`
  gap: 6px;
`;

const ControlLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${props => props.$active ? 'var(--cinema-gold)' : 'inherit'};
  transition: color 0.3s;

  @media (max-width: 400px) {
    display: none;
  }
`;

const CountBadge = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(0, 168, 232, 0.15)' : 'rgba(255, 255, 255, 0.06)'};
  color: ${props => props.$active ? 'var(--flare-blue)' : 'var(--text-dim)'};
  font-family: var(--font-mono);
  transition: all 0.2s;
`;

const ControlDivider = styled.div`
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 4px;
`;

const CharCounter = styled.span`
  font-size: 0.6rem;
  font-family: var(--font-mono);
  color: ${props => props.$near ? 'var(--alert-red)' : 'var(--text-dim)'};
  opacity: ${props => props.$percent > 0 ? 0.8 : 0.4};
  transition: all 0.3s;
  letter-spacing: 0.5px;
`;

const GlowLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: ${props => props.$dreamMode 
    ? 'linear-gradient(90deg, transparent, var(--cinema-gold), transparent)' 
    : 'linear-gradient(90deg, transparent, var(--flare-blue), transparent)'};
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.4s ease;
  animation: ${props => props.$visible ? css`${pulseGlow} 2s ease infinite` : 'none'};
`;

export default ChatInput;
