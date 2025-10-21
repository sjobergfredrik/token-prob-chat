import React, { useState, useRef, useEffect } from 'react';
import { getCompletion } from '../services/openaiService';
import { ForceGraph2D } from 'react-force-graph';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './Chat.css';
import logo from '../uu-logo-red.svg';

const getColor = (probability) => {
  // Red to yellow to green gradient
  if (probability < 0.3) {
    return `rgba(255, 0, 0, ${0.2 + probability * 2})`; // More red for very low probs
  } else if (probability < 0.7) {
    return `rgba(255, ${Math.floor(255 * (probability - 0.3) / 0.4)}, 0, 0.5)`; // Yellow transition
  } else {
    return `rgba(0, 255, 0, ${probability * 0.5})`; // Green for high probs
  }
};

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tokenTree, setTokenTree] = useState(null);
  const [temperature, setTemperature] = useState(0.3);
  const messagesEndRef = useRef(null);
  const graphRef = useRef(null);

  // Reset currentStep when a new message is added
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'assistant') {
      setCurrentStep(0);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildTokenTree = (tokens, alternatives) => {
    const nodes = [];
    const links = [];
    let id = 0;

    // Add root node
    nodes.push({
      id: id++,
      name: 'Start',
      level: 0
    });

    tokens.forEach((token, idx) => {
      // Add main token
      const tokenNode = {
        id: id++,
        name: token.token,
        probability: token.probability,
        level: idx + 1
      };
      nodes.push(tokenNode);

      // Add link from previous token
      links.push({
        source: id - 2,
        target: id - 1,
        value: token.probability
      });

      // Add alternative tokens
      token.alternatives.slice(0, 3).forEach(alt => {
        const altNode = {
          id: id++,
          name: alt.token,
          probability: alt.probability,
          level: idx + 1,
          isAlternative: true
        };
        nodes.push(altNode);
        links.push({
          source: id - 2,
          target: id - 1,
          value: alt.probability
        });
      });
    });

    return { nodes, links };
  };

  const renderTokenWithTooltip = (token, index) => {
    const hasStrongAlternatives = token.alternatives.some(alt => alt.probability > token.probability * 0.8);
    
    const tooltipContent = (
      <div className="token-tooltip">
        <div><strong>Token:</strong> {token.token}</div>
        <div><strong>Probability:</strong> {(token.probability * 100).toFixed(1)}%</div>
        {token.alternatives.length > 0 && (
          <div className="alternatives">
            <strong>Alternatives:</strong>
            {token.alternatives.map((alt, i) => (
              <div key={i} style={{
                color: alt.probability > token.probability * 0.8 ? '#ff6b6b' : 'inherit'
              }}>
                {alt.token}: {(alt.probability * 100).toFixed(1)}%
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <Tippy key={index} content={tooltipContent} placement="top">
        <span
          className={`token ${hasStrongAlternatives ? 'has-alternatives' : ''}`}
          style={{ 
            backgroundColor: getColor(token.probability),
            borderBottom: hasStrongAlternatives ? '2px dashed #ff6b6b' : 'none',
            padding: '2px 0',
            margin: '0 1px',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'inline-block'
          }}
          onClick={() => setCurrentStep(index)}
        >
          {token.token.replace('Ġ', ' ')}
          {hasStrongAlternatives && 
            <span style={{ 
              fontSize: '0.7em', 
              verticalAlign: 'super',
              color: '#ff6b6b',
              marginLeft: '2px'
            }}>*</span>
          }
        </span>
      </Tippy>
    );
  };

  const renderTokens = (tokens) => {
    return tokens.map((token, index) => renderTokenWithTooltip(token, index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    const currentPrompt = prompt.trim();
    const userMessage = { type: 'user', content: currentPrompt };

    // Prepare the messages array for the API call, including the new user message.
    // Note: `messages` here is the state from the current render cycle.
    const messagesForApi = [...messages, userMessage];

    // Update the UI immediately with the user's message.
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setPrompt(''); // Clear input field after grabbing its value and updating state.

    try {
      // Pass the current prompt and the constructed list of messages to the API.
      const response = await getCompletion(currentPrompt, messagesForApi, 150, temperature);

      const { text, logprobs } = response.choices[0];
      const { tokens, token_logprobs, top_logprobs } = logprobs;

      const processedTokens = tokens.map((token, index) => ({
        token,
        probability: Math.exp(token_logprobs[index]),
        alternatives: top_logprobs[index] ? Object.entries(top_logprobs[index]).map(([altToken, logprob]) => ({
          token: altToken,
          probability: Math.exp(logprob)
        })) : []
      }));

      const assistantMessage = {
        type: 'assistant',
        tokens: processedTokens,
        content: text
      };

      // Add assistant's message to the state.
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="uu-header">
        <div className="uu-header-content">
          <img src={logo} alt="Uppsala Universitet" className="uu-logo" />
          <div className="uu-title-section">
            <h1 className="uu-main-title">Inference Insights</h1>
            <p className="uu-subtitle">Medarbetare</p>
          </div>
          <div className="uu-nav">
            <a href="#" className="uu-nav-link">Logga in</a>
            <a href="#" className="uu-nav-link">Sök</a>
            <a href="#" className="uu-nav-link">English</a>
            <a href="#" className="uu-nav-link">Meny</a>
          </div>
        </div>
      </div>
      <div className="chat-header">
        <p className="app-description">Chat with an AI and see how it thinks. Explore token probabilities to understand response confidence and alternative suggestions.</p>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.85) }}></span>
            <span>High confidence (≥50%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.5) }}></span>
            <span>Medium confidence (20-49%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.15) }}></span>
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
                <div className="tokens-container">
                  {renderTokens(message.tokens)}
                </div>
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
            placeholder="Sök i medarbetare/skriv ditt meddelande..."
            disabled={isLoading}
            className="prompt-input"
          />
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Skickar...' : 'Sök'}
          </button>
        </form>
      </div>
      <div className="uu-footer">
        <div className="uu-footer-content">
          <p>© Uppsala universitet 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Chat; 