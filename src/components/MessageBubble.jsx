import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ content, isUser }) => {
  const cleanContent = React.useMemo(() => {
    if (!content) return '';
    let processed = typeof content === 'string' ? content : String(content);
    processed = processed.replace(/([^\n])\n(-|\*|\d+\.) /g, '$1\n\n$2 ');
    processed = processed.replace(/([^\n])```/g, '$1\n```');
    processed = processed.replace(/\\n/g, '\n');
    return processed;
  }, [content]);

  return (
    <Row $isUser={isUser}>
      <Bubble $isUser={isUser}>
        <MarkdownContainer $isUser={isUser}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match && (!node?.properties?.className);
                return !isInline && match ? (
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
              tr: ({node, ...props}) => <StyledTr {...props} />,
              th: ({node, ...props}) => <StyledTh {...props} />,
              td: ({node, ...props}) => <StyledTd {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: '0.7em', lineHeight: '1.65' }} {...props} />,
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </MarkdownContainer>
      </Bubble>
    </Row>
  );
};

const Row = styled.div`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  width: 100%;
  margin-bottom: 8px;
  /* Animation handled by MessageGroup in App.jsx */
`;

const Bubble = styled.div`
  background: ${props => props.$isUser 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(12, 12, 12, 0.6)'};
  
  border: 1px solid ${props => props.$isUser 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.05)'};

  border-radius: ${props => props.$isUser 
    ? '18px 18px 4px 18px' 
    : '18px 18px 18px 4px'};
    
  padding: 12px 18px;
  color: var(--text-main);
  font-size: 0.9rem;
  line-height: 1.65;
  max-width: 80%;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 600px) {
    max-width: 90%;
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

const MarkdownContainer = styled.div`
  & > *:first-child { margin-top: 0; }
  & > *:last-child { margin-bottom: 0; }

  p { margin: 0.4em 0; }
  
  a {
    color: var(--flare-blue);
    text-decoration: none;
    border-bottom: 1px dashed rgba(0, 168, 232, 0.4);
    transition: all 0.2s;
    &:hover {
      color: #fff;
      border-bottom-color: #fff;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  h1, h2, h3 {
    color: #fff;
    font-family: var(--font-header);
    margin-top: 0.8em;
    margin-bottom: 0.3em;
    font-weight: 600;
  }

  strong { color: var(--text-proj); font-weight: 600; }

  blockquote {
    border-left: 2px solid var(--cinema-gold);
    margin: 0.6em 0;
    padding: 6px 12px;
    color: var(--text-secondary);
    background: rgba(250, 204, 21, 0.03);
    border-radius: 0 6px 6px 0;
    font-style: italic;
  }

  ul, ol {
    margin: 0.4em 0;
    padding-left: 1.3em;
  }
  li { margin-bottom: 0.15em; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
  overflow-x: auto;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.15);
  font-size: 0.85em;
`;

const StyledTr = styled.tr`
  &:nth-child(even) { background: rgba(255, 255, 255, 0.02); }
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const StyledTh = styled.th`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  background: rgba(255, 255, 255, 0.04);
  color: var(--cinema-gold);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  text-align: left;
  color: var(--text-secondary);
`;

const CodeBlock = styled.div`
  margin: 0.6em 0;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  overflow: hidden;

  pre {
    margin: 0;
    padding: 12px 14px;
    overflow-x: auto;
    font-size: 0.85em;
    line-height: 1.5;
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }
`;

const CodeHeader = styled.div`
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

const InlineCode = styled.code`
  background: rgba(255, 255, 255, 0.07);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.88em;
  color: var(--accent-peach);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export default MessageBubble;
