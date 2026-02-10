import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MeltingText = ({
  text = "PolyMind",
  primaryColor = "#FACC15",
  secondaryColor = "#FB923C",
  accentColor = "#4F46E5",
}) => {
  const containerRef = useRef(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  return (
    <Container ref={containerRef} onMouseMove={handleMouseMove}>
      <VisuallyHidden>
        {/* SVG Filters Definition */}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="heat-distortion" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.015 0.005" 
                numOctaves="2" 
                result="noise"
                seed="5"
              >
                <animate 
                  attributeName="baseFrequency" 
                  dur="10s" 
                  values="0.015 0.005; 0.015 0.008; 0.015 0.005" 
                  repeatCount="indefinite" 
                />
              </feTurbulence>
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale="10" 
                xChannelSelector="R" 
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>
        </svg>
      </VisuallyHidden>

      <Wrapper>
        {/* Text Container */}
        <TextGroup>
          {/* Shadow Layer (Blue/Purple) */}
          <StyledHeading 
            $color={accentColor}
            style={{ 
              filter: 'url(#heat-distortion)',
              opacity: 0.8,
              transform: 'scale(1.02)',
              top: '2px',
              left: '2px'
            }}
          >
            {text}
          </StyledHeading>

          {/* Mid Layer (Orange) */}
          <StyledHeading 
            $color={secondaryColor}
            style={{ 
              filter: 'url(#heat-distortion)',
              mixBlendMode: 'multiply',
              top: '1px',
              left: '1px'
            }}
          >
            {text}
          </StyledHeading>

          {/* Main Text Layer (Yellow/White) */}
          <StyledHeading style={{ filter: 'url(#heat-distortion)', zIndex: 20, position: 'relative' }}>
             <GradientText>
               {text}
             </GradientText>
          </StyledHeading>

          {/* Sharp Overlay */}
          <StyledHeading 
             style={{ 
               mixBlendMode: 'overlay', 
               opacity: 0.5, 
               color: 'white',
               top: 0,
               left: 0
             }}
          >
            {text}
          </StyledHeading>
        </TextGroup>
      </Wrapper>
    </Container>
  );
};

// Styled Components

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

const VisuallyHidden = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
`;

const Wrapper = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextGroup = styled.div`
  position: relative;
  cursor: default;
`;

const StyledHeading = styled.h1`
  font-family: var(--font-header, 'Oswald', sans-serif);
  font-weight: 900;
  font-size: 2.5rem; /* Scaled down for header pill */
  line-height: 1;
  letter-spacing: -0.05em;
  text-align: center;
  user-select: none;
  position: absolute;
  width: 100%;
  color: ${props => props.$color || 'inherit'};
  
  /* Reset relative positioning for the main layer which overrides this */
`;

const GradientText = styled.span`
  background: linear-gradient(to bottom, #fef08a, #facc15, #f97316); /* yellow-200 to orange-500 */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export default MeltingText;
