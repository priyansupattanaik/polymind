
import React from 'react';
import styled from 'styled-components';
import Switch from './Switch';

const ModelSelector = ({ isOpen, onClose, availableModels, activeModels, toggleModel }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Council Members</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <ModelList>
          {availableModels.map(model => (
            <ModelItem key={model.id}>
              <Switch 
                isOn={activeModels.includes(model.id)} 
                handleToggle={() => toggleModel(model.id)}
                id={`switch-${model.id}`}
              />
              <ModelName>{model.name}</ModelName>
            </ModelItem>
          ))}
        </ModelList>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: rgba(30, 30, 35, 0.7);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  padding: 30px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  transform: scale(0.95);
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  @keyframes scaleIn {
    to { transform: scale(1); }
  }
  
  /* Custom Scrollbar for Modal */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #fff;
  }
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

export default ModelSelector;
