import React from 'react';
import styled from 'styled-components';
import MeltingText from './MeltingText';

const Header = () => {
  return (
    <PillHeaderContainer>
      <Pill>
        <MeltingText text="PolyMind" />
      </Pill>
    </PillHeaderContainer>
  );
};

const PillHeaderContainer = styled.header`
  position: fixed;
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
  pointer-events: none; /* Allow clicks to pass through around the pill */
`;

const Pill = styled.div`
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 40px;
  border-radius: 100px;
  pointer-events: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  height: 60px;
  overflow: hidden;
`;

export default Header;
