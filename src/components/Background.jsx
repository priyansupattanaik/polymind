import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import bgImage from '../assets/flower_bg.png';

// --- Styled Components ---

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  background-color: var(--bg-void);

  @supports (height: 100dvh) {
    height: 100dvh;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  filter: contrast(1.1) saturate(1.1);
  will-change: transform;
  animation: slowZoom 60s infinite alternate;

  @keyframes slowZoom {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
  }

  @media (max-width: 600px) {
    animation-duration: 90s;
  }
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%; /* Fade starts from bottom 50% */
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(5, 5, 5, 0.6) 60%,
    rgba(5, 5, 5, 1) 100%
  );
  pointer-events: none;
`;

const Vignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    transparent 50%,
    rgba(5, 5, 5, 0.7) 100%
  );
  pointer-events: none;
`;

// --- Sparkle System ---

const sparkleAnimation = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
`;

const SparkleContainer = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
`;

const Sparkle = styled.div`
  position: absolute;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 215, 0, 0.2) 60%, transparent 100%);
  border-radius: 50%;
  box-shadow: 0 0 ${props => props.$size * 2}px ${props => props.$color || 'rgba(255, 255, 255, 0.6)'};
  animation: ${sparkleAnimation} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  mix-blend-mode: screen;
`;

const Background = () => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Fewer sparkles on mobile for performance
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    const count = isMobile ? 12 : 30;
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2, // 2px to 8px
      duration: Math.random() * 4 + 3, // 3s to 7s
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' // Gold or White
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <BackgroundContainer>
      <StyledImage src={bgImage} alt="Cinematic Background" />
      <SparkleContainer>
        {sparkles.map(s => (
          <Sparkle 
            key={s.id} 
            $top={s.top} 
            $left={s.left} 
            $size={s.size} 
            $duration={s.duration} 
            $delay={s.delay}
            $color={s.color}
          />
        ))}
      </SparkleContainer>
      <Vignette />
      <GradientOverlay />
    </BackgroundContainer>
  );
};

export default Background;