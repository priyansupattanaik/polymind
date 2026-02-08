import React from 'react';

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
        <div style={{ padding: 20, color: 'white', background: 'rgba(255,0,0,0.1)', borderRadius: 8 }}>
          <h3>Something went wrong.</h3>
          <pre style={{ overflow: 'auto' }}>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
