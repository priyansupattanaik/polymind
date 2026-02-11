import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(-100%); opacity: 0; }
`;

const ChatHistory = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSwitchConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onClose} />
      <Panel>
        <PanelHeader>
          <PanelTitle>Conversations</PanelTitle>
          <CloseBtn onClick={onClose} aria-label="Close history">
            <X size={18} />
          </CloseBtn>
        </PanelHeader>

        <NewChatBtn onClick={() => { onNewChat(); onClose(); }}>
          <Plus size={16} />
          New Chat
        </NewChatBtn>

        <ConversationList>
          {conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              $active={conv.id === activeConversationId}
              onClick={() => { onSwitchConversation(conv.id); onClose(); }}
            >
              <ConvIcon>
                <MessageSquare size={14} />
              </ConvIcon>
              <ConvInfo>
                <ConvTitle>{conv.title}</ConvTitle>
                <ConvMeta>{conv.messages.length} messages</ConvMeta>
              </ConvInfo>
              {conversations.length > 1 && (
                <DeleteBtn
                  onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                  aria-label="Delete conversation"
                >
                  <Trash2 size={13} />
                </DeleteBtn>
              )}
            </ConversationItem>
          ))}
        </ConversationList>
      </Panel>
    </>
  );
};

export default ChatHistory;

/* ── Styled Components ── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 998;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: rgba(12, 12, 15, 0.96);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 999;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.25s ease-out;

  @supports (height: 100dvh) {
    height: 100dvh;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const PanelTitle = styled.span`
  font-family: var(--font-header);
  font-size: 0.8rem;
  color: var(--cinema-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const NewChatBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 12px 8px;
  padding: 10px 14px;
  background: rgba(250, 204, 21, 0.08);
  border: 1px dashed rgba(250, 204, 21, 0.25);
  border-radius: 10px;
  color: var(--cinema-gold);
  font-family: var(--font-header);
  font-size: 0.78rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: rgba(250, 204, 21, 0.14);
    border-color: rgba(250, 204, 21, 0.45);
    transform: translateY(-1px);
  }
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 16px;
  
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;

  ${props => props.$active
    ? css`
        background: rgba(250, 204, 21, 0.1);
        border: 1px solid rgba(250, 204, 21, 0.18);
      `
    : css`
        background: transparent;
        border: 1px solid transparent;
        &:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.06);
        }
      `
  }
`;

const ConvIcon = styled.div`
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  margin-top: 1px;
`;

const ConvInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConvTitle = styled.div`
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const ConvMeta = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  margin-top: 2px;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;

  ${ConversationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
`;
