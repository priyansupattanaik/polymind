import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Cpu } from 'lucide-react'; // Note: Cpu icon not used directly in styled component but needed for logic later if extended

const MessageBubble = ({ content, isUser }) => {
  // Pre-process content to ensure markdown parses correctly
  const cleanContent = React.useMemo(() => {
    if (!content) return '';
    let processed = typeof content === 'string' ? content : String(content);
    
    // Ensure properly spaced formatting for Markdown
    // 1. Ensure lists have preceding newlines
    processed = processed.replace(/([^\n])\n(-|\*|\d+\.) /g, '$1\n\n$2 ');
    
    // 2. Ensure code blocks have newlines
    processed = processed.replace(/([^\n])```/g, '$1\n```');
    
    // 3. Fix common double-escape issues if any (e.g. \\n becoming \n)
    processed = processed.replace(/\\n/g, '\n');

    return processed;
  }, [content]);

  return (
    <BubbleWrapper $isUser={isUser}>
      <Bubble $isUser={isUser} className={!isUser ? "glass-panel cyber-border" : ""}>
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
              },
              table: ({node, ...props}) => <StyledTable {...props} />,
              thead: ({node, ...props}) => <thead {...props} />,
              tbody: ({node, ...props}) => <tbody {...props} />,
              tr: ({node, ...props}) => <StyledTr {...props} />,
              th: ({node, ...props}) => <StyledTh {...props} />,
              td: ({node, ...props}) => <StyledTd {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: '1em', lineHeight: '1.6' }} {...props} />,
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </MarkdownContainer>
      </Bubble>
    </BubbleWrapper>
  );
};

const BubbleWrapper = styled.div`
    display: flex;
    justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    width: 100%;
    margin-bottom: 2px;
`;

const Bubble = styled.div`
  background: ${props => props.$isUser 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(10, 22, 40, 0.6)'};
  
  border: ${props => props.$isUser 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : '1px solid rgba(255, 107, 107, 0.3)'};

  border-radius: ${props => props.$isUser 
    ? '20px 20px 4px 20px' 
    : '20px 20px 20px 4px'};
    
  padding: 16px 24px;
  color: var(--text-main);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 100%;
  position: relative;
  backdrop-filter: blur(8px);
  box-shadow: ${props => props.$isUser 
    ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
    : '0 4px 20px rgba(0, 0, 0, 0.1)'};
`;

const MarkdownContainer = styled.div`
  & > *:first-child { margin-top: 0; }
  & > *:last-child { margin-bottom: 0; }

  p { margin: 0.5em 0; }
  
  a {
    color: var(--accent-peach);
    text-decoration: none;
    border-bottom: 1px dashed var(--accent-peach);
    transition: all 0.2s;
    &:hover {
        color: #fff;
        border-bottom-style: solid;
        text-shadow: 0 0 8px var(--accent-peach);
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 12px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h1, h2, h3 {
    color: #fff;
    font-family: var(--font-header);
    margin-top: 1em;
    font-weight: 600;
  }

  blockquote {
    border-left: 3px solid var(--accent-coral);
    margin: 1em 0;
    padding-left: 1em;
    font-style: italic;
    color: var(--text-secondary);
    background: rgba(255, 107, 107, 0.05);
    padding: 8px 12px;
    border-radius: 4px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  overflow-x: auto;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.1);
`;

const StyledTr = styled.tr`
  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
  }
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StyledTh = styled.th`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  color: var(--accent-peach);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
`;

const StyledTd = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
  color: var(--text-secondary);
`;

const StyledStrong = styled.strong`
  font-weight: 700;
  color: #fff;
`;

const StyledEm = styled.em`
  font-style: italic;
  color: var(--accent-peach);
`;

const CodeBlock = styled.div`
  margin: 1em 0;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const CodeHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 0.75em;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InlineCode = styled.code`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export default MessageBubble;
