import React, { useState, useRef, useEffect } from 'react';
import { getCompletion } from '../services/openaiService';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './Chat.css';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message immediately
    const userMessage = {
      type: 'user',
      content: prompt.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError('');
    setPrompt(''); // Clear input after sending
    
    try {
      const response = await getCompletion(prompt);
      
      // Extract tokens and their probabilities from the completions API response
      const { text, logprobs } = response.choices[0];
      const { tokens, token_logprobs, top_logprobs } = logprobs;
      
      // Create token objects with probability data
      const processedTokens = tokens.map((token, index) => ({
        token,
        probability: Math.exp(token_logprobs[index]), // Convert log probability to probability
        alternatives: top_logprobs[index] ? Object.entries(top_logprobs[index]).map(([token, logprob]) => ({
          token,
          probability: Math.exp(logprob)
        })) : []
      }));
      
      // Add assistant message
      const assistantMessage = {
        type: 'assistant',
        tokens: processedTokens
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log('Response:', response);
      console.log('Processed tokens:', processedTokens);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get response. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine color based on probability
  const getColor = (probability) => {
    if (probability >= 0.5) return 'green';
    if (probability >= 0.2) return 'yellow';
    return 'red';
  };

  // Format probability as percentage
  const formatProbability = (prob) => `${(prob * 100).toFixed(1)}%`;

  const renderTokens = (tokens) => {
    // Group tokens into words more intelligently
    const words = [];
    let currentWord = [];
    let currentWordProbability = 0;
    let tokenCount = 0;
    
    tokens.forEach((tObj) => {
      // Clean the token from special characters
      const cleanToken = tObj.token.replace('Ġ', '');
      
      // Start a new word if:
      // 1. Current token starts with a space
      // 2. Current token is punctuation
      // 3. We're at the start
      if (tObj.token.startsWith('Ġ') || 
          tObj.token.match(/^[.,!?;:]/) || 
          currentWord.length === 0) {
        
        if (currentWord.length > 0) {
          // Calculate average probability for the word
          const avgProb = currentWordProbability / tokenCount;
          words.push({
            tokens: currentWord,
            averageProbability: avgProb
          });
        }
        currentWord = [tObj];
        currentWordProbability = tObj.probability;
        tokenCount = 1;
      } else {
        currentWord.push(tObj);
        currentWordProbability += tObj.probability;
        tokenCount++;
      }
    });
    
    // Add the last word if exists
    if (currentWord.length > 0) {
      const avgProb = currentWordProbability / tokenCount;
      words.push({
        tokens: currentWord,
        averageProbability: avgProb
      });
    }

    return (
      <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
        {words.map((word, wordIndex) => {
          const avgProb = word.averageProbability;
          const combinedText = word.tokens
            .map(t => t.token.replace('Ġ', ''))
            .join('');

          return (
            <Tippy
              key={wordIndex}
              content={
                <div className="token-tooltip">
                  <div><strong>Word:</strong> "{combinedText}"</div>
                  <div><strong>Confidence:</strong> {formatProbability(avgProb)}</div>
                  <div><strong>Tokens:</strong></div>
                  {word.tokens.map((tObj, i) => (
                    <div key={i} style={{marginLeft: '10px'}}>
                      • "{tObj.token}": {formatProbability(tObj.probability)}
                    </div>
                  ))}
                </div>
              }
              placement="top"
              arrow={true}
              duration={200}
            >
              <span
                className="word"
                style={{ 
                  backgroundColor: getColor(avgProb),
                  padding: '2px 4px',
                  margin: '0 3px',
                  borderRadius: '3px',
                  display: 'inline-block',
                  cursor: 'help',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  position: 'relative',
                  lineHeight: '1.5'
                }}
              >
                {combinedText}
                {!combinedText.match(/^[.,!?;:]/) &&
                  <span style={{
                    position: 'absolute',
                    right: '-3px',
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    zIndex: 1
                  }} />
                }
              </span>
            </Tippy>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>OpenAI Chat</h1>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
            <span>High confidence (≥50%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'yellow' }}></span>
            <span>Medium confidence (20-49%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
            <span>Low confidence (&lt;20%)</span>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-header">{message.type === 'user' ? 'You' : 'Assistant'}</div>
            <div className="message-content">
              {message.type === 'user' ? (
                message.content
              ) : (
                renderTokens(message.tokens)
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-header">Assistant</div>
            <div className="message-content typing">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="input-container">
        <form onSubmit={handleSubmit} className="prompt-form">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="prompt-input"
          />
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 