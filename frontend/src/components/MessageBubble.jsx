import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ content, isUser }) => {
  return (
    <Bubble $isUser={isUser}>
      <MarkdownContainer>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <CodeBlock>
                  <CodeHeader>{match[1]}</CodeHeader>
                  <pre className={className} {...props}>
                    <code>{children}</code>
                  </pre>
                </CodeBlock>
              ) : (
                <InlineCode className={className} {...props}>
                  {children}
                </InlineCode>
              )
            }
          }}
        >
          {typeof content === 'string' ? content : String(content || '')}
        </ReactMarkdown>
      </MarkdownContainer>
    </Bubble>
  );
};

const Bubble = styled.div`
  background: ${props => props.$isUser 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)' 
    : 'rgba(30, 30, 35, 0.8)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 10px 24px;
  border-radius: 20px;
  border-bottom-right-radius: ${props => props.$isUser ? '4px' : '20px'};
  border-bottom-left-radius: ${props => props.$isUser ? '20px' : '4px'};
  line-height: 1.6;
  box-shadow: ${props => props.$isUser 
    ? '0 8px 32px rgba(99, 102, 241, 0.15)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isUser 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(255, 255, 255, 0.05)'};
  font-size: 1rem;
  color: ${props => props.$isUser ? '#ffffff' : '#e2e8f0'};
  max-width: 100%;
  overflow-wrap: break-word;
`;

const MarkdownContainer = styled.div`
  & > *:first-child { margin-top: 0; }
  & > *:last-child { margin-bottom: 0; }

  p {
    margin: 0.5em 0;
  }

  a {
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    margin: 0.5em 0;
    padding-left: 1em;
    font-style: italic;
    color: rgba(255, 255, 255, 0.7);
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0.8em 0 0.4em;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.1em; }
`;

const CodeBlock = styled.div`
  margin: 1em 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);

  pre {
    margin: 0;
    padding: 1em;
    overflow-x: auto;
    font-family: 'Fira Code', 'Roboto Mono', monospace;
    font-size: 0.9em;
  }
`;

const CodeHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InlineCode = styled.code`
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Roboto Mono', monospace;
  font-size: 0.9em;
  color: #fff;
`;

export default MessageBubble;
