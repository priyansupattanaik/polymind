import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer className="glass-panel">
          <ErrorHeader>
             <AlertTriangle color="#ff4757" size={24} />
             <ErrorTitle>SYSTEM MALFUNCTION DETECTED</ErrorTitle>
          </ErrorHeader>
          <ErrorMessage>
            {this.state.error && this.state.error.toString()}
          </ErrorMessage>
          <RebootHint>TRY REFRESHING THE NEURAL LINK</RebootHint>
        </ErrorContainer>
      );
    }

    return this.props.children; 
  }
}

const ErrorContainer = styled.div`
  padding: 24px;
  border: 1px solid #ff4757;
  border-radius: 8px;
  background: rgba(255, 71, 87, 0.1);
  margin: 20px;
  max-width: 600px;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 71, 87, 0.3);
  padding-bottom: 12px;
`;

const ErrorTitle = styled.h3`
  font-family: var(--font-header);
  color: #ff4757;
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: 1px;
`;

const ErrorMessage = styled.pre`
  font-family: var(--font-mono);
  color: var(--text-main);
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
`;

const RebootHint = styled.div`
  margin-top: 16px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: rgba(255, 71, 87, 0.8);
  text-align: center;
  animation: pulse 2s infinite;

  @keyframes pulse {
    50% { opacity: 0.5; }
  }
`;

export default ErrorBoundary;
