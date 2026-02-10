import React from 'react';
import styled from 'styled-components';
import { X, Cpu, Zap, Brain, Shield, Rocket, Sparkles, Box } from 'lucide-react';
import Switch from './Switch';

const ModelSelector = ({ isOpen, onClose, availableModels, activeModels, toggleModel }) => {
  if (!isOpen) return null;

  const getModelIcon = (id) => {
    if (id.includes('llama')) return <Brain size={24} color="#FDCB6E" />;
    if (id.includes('mixtral') || id.includes('mistral')) return <Zap size={24} color="#00D2D3" />;
    if (id.includes('gemma')) return <Sparkles size={24} color="#d63031" />;
    if (id.includes('qwen')) return <Shield size={24} color="#0984e3" />;
    if (id.includes('gpt')) return <Cpu size={24} color="#6C5CE7" />;
    return <Box size={24} color="#b2bec3" />;
  };

  return (
    <Overlay onClick={onClose}>
      <Container onClick={e => e.stopPropagation()} className="glass-panel">
        <Header>
            <Title>
                <Cpu size={28} />
                <span>COUNCIL PROTOCOL</span>
            </Title>
            <CloseButton onClick={onClose}>
                <X size={24} />
            </CloseButton>
        </Header>
        
        <Grid>
            {availableModels.map(model => {
                const isActive = activeModels.includes(model.id);
                return (
                    <Card key={model.id} $isActive={isActive} onClick={() => toggleModel(model.id)}>
                        <CardHeader>
                            <IconWrapper $isActive={isActive}>
                                {getModelIcon(model.id)}
                            </IconWrapper>
                            <Switch 
                                isOn={isActive} 
                                handleToggle={() => toggleModel(model.id)}
                                id={`switch-${model.id}`}
                            />
                        </CardHeader>
                        <CardBody>
                            <ModelName $isActive={isActive}>{model.name}</ModelName>
                            <ModelId>{model.id}</ModelId>
                            <StatusIndicator $isActive={isActive}>
                                {isActive ? 'ONLINE' : 'OFFLINE'}
                            </StatusIndicator>
                        </CardBody>
                    </Card>
                );
            })}
        </Grid>
      </Container>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.8);
  backdrop-filter: blur(16px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const Container = styled.div`
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);

  @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

const Header = styled.div`
  padding: 32px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.2);
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-header);
  font-size: 1.5rem;
  color: var(--text-main);
  font-weight: 600;
  letter-spacing: -0.5px;
  
  svg { color: var(--accent-coral); }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover { 
    background: rgba(255, 255, 255, 0.1);
    color: #fff; 
    transform: rotate(90deg); 
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 40px;
  overflow-y: auto;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 16px;
  }
`;

const Card = styled.div`
  background: ${props => props.$isActive ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255,255,255,0.02)'};
  border: 1px solid ${props => props.$isActive ? 'var(--accent-coral)' : 'rgba(255,255,255,0.05)'};
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    background: ${props => props.$isActive ? 'rgba(255, 107, 107, 0.08)' : 'rgba(255,255,255,0.05)'};
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
`;


const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  padding: 10px;
  border-radius: 10px;
  background: ${props => props.$isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)'};
  opacity: ${props => props.$isActive ? 1 : 0.5};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModelName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isActive ? '#fff' : 'var(--text-muted)'};
`;

const ModelId = styled.span`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.7;
`;

const StatusIndicator = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  margin-top: 12px;
  display: inline-block;
  color: ${props => props.$isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'};
  text-shadow: ${props => props.$isActive ? '0 0 8px var(--accent-cyan)' : 'none'};
  
  &::before {
    content: '●';
    margin-right: 6px;
  }
`;

export default ModelSelector;
