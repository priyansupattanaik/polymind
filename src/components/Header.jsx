import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import MeltingText from './MeltingText';

const Header = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <PillHeaderContainer>
      <Pill 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        $hovered={isHovered}
      >
        <MeltingText text="PolyMind" />
        <GlowRing $visible={isHovered} />
      </Pill>
    </PillHeaderContainer>
  );
};

const breathe = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(250, 204, 21, 0); }
  50% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 12px 2px rgba(250, 204, 21, 0.08); }
`;

const PillHeaderContainer = styled.header`
  position: fixed;
  top: 14px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
`;

const Pill = styled.div`
  background: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 32px;
  border-radius: 100px;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  height: 44px;
  overflow: hidden;
  position: relative;
  cursor: default;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: ${breathe} 4s ease-in-out infinite;

  ${props => props.$hovered && css`
    border-color: rgba(250, 204, 21, 0.25);
    transform: scale(1.03);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 0 20px 4px rgba(250, 204, 21, 0.1);
  `}

  @media (max-width: 480px) {
    min-width: 140px;
    height: 38px;
    padding: 4px 24px;
  }
`;

const GlowRing = styled.div`
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.15), transparent 40%, transparent 60%, rgba(249, 115, 22, 0.15));
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.4s ease;
  pointer-events: none;
`;

export default Header;
