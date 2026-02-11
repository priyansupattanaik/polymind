import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { X, Cpu, Zap, Brain, Shield, Sparkles, Box } from 'lucide-react';
import Switch from './Switch';

const ModelSelector = ({ isOpen, onClose, availableModels, activeModels, toggleModel }) => {
  if (!isOpen) return null;

  const getModelIcon = (id) => {
    if (id.includes('llama') || id.includes('versatile')) return <Brain size={20} />;
    if (id.includes('mixtral') || id.includes('mistral')) return <Zap size={20} />;
    if (id.includes('gemma') || id.includes('sparkle')) return <Sparkles size={20} />;
    if (id.includes('qwen')) return <Shield size={20} />;
    if (id.includes('gpt') || id.includes('deepseek')) return <Cpu size={20} />;
    if (id.includes('aurora') || id.includes('trinity')) return <Zap size={20} />;
    if (id.includes('liquid')) return <Sparkles size={20} />;
    if (id.includes('seed')) return <Sparkles size={20} />;
    return <Box size={20} />;
  };

  const getModelColor = (id) => {
    if (id.includes('qwen')) return '#0984e3';
    if (id.includes('gpt')) return '#6C5CE7';
    if (id.includes('llama') || id.includes('versatile')) return '#FDCB6E';
    if (id.includes('deepseek')) return '#00D2D3';
    if (id.includes('aurora')) return '#FF6B6B';
    if (id.includes('trinity')) return '#a29bfe';
    if (id.includes('liquid')) return '#55efc4';
    if (id.includes('seed')) return '#fd79a8';
    return '#b2bec3';
  };

  const activeCount = activeModels.length;

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={e => e.stopPropagation()}>
        <PanelHeader>
          <HeaderLeft>
            <HeaderTitle>Council Models</HeaderTitle>
            <ActiveBadge>{activeCount} active</ActiveBadge>
          </HeaderLeft>
          <CloseBtn onClick={onClose} title="Close">
            <X size={18} />
          </CloseBtn>
        </PanelHeader>

        <ModelList>
          {availableModels.map((model, index) => {
            const isActive = activeModels.includes(model.id);
            const color = getModelColor(model.id);
            return (
              <ModelRow 
                key={model.id} 
                $isActive={isActive}
                $color={color}
                $index={index}
                onClick={() => toggleModel(model.id)}
              >
                <ModelLeft>
                  <IconCircle $isActive={isActive} $color={color}>
                    {getModelIcon(model.id)}
                  </IconCircle>
                  <ModelInfo>
                    <ModelName $isActive={isActive}>{model.name}</ModelName>
                    <ModelIdText>{model.id}</ModelIdText>
                  </ModelInfo>
                </ModelLeft>
                <Switch 
                  checked={isActive} 
                  onChange={() => toggleModel(model.id)} 
                />
              </ModelRow>
            );
          })}
        </ModelList>
      </Panel>
    </Overlay>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
`;

const rowAppear = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
  padding: 20px;
`;

const Panel = styled.div`
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  @media (max-width: 520px) {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 16px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 480px) {
    padding: 16px 18px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-family: var(--font-header);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-proj);
  letter-spacing: 0.5px;
`;

const ActiveBadge = styled.span`
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  background: rgba(0, 210, 211, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-proj);
    transform: rotate(90deg);
  }
`;

const ModelList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  overflow-y: auto;
  gap: 2px;
`;

const ModelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${rowAppear} 0.3s ease both;
  animation-delay: ${props => props.$index * 0.04}s;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.03)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const ModelLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const IconCircle = styled.div`
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isActive ? `${props.$color}18` : 'rgba(255, 255, 255, 0.04)'};
  color: ${props => props.$isActive ? props.$color : 'var(--text-dim)'};
  transition: all 0.25s ease;
`;

const ModelInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ModelName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.$isActive ? 'var(--text-proj)' : 'var(--text-muted)'};
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ModelIdText = styled.span`
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-dim);
  opacity: 0.6;
`;

export default ModelSelector;
