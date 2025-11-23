import React, { useState, useEffect } from 'react';
import { getCompletion } from '../services/openaiService';
import './Chat.css';
import Header from './chat/Header';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';

import TokenProbChart from './chat/TokenProbChart';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [temperature, setTemperature] = useState(0.3);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'assistant') {
      setCurrentStep(0);
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    const currentPrompt = prompt.trim();
    const userMessage = { type: 'user', content: currentPrompt };

    const messagesForApi = [...messages, userMessage].map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setPrompt('');

    try {
      const response = await getCompletion(messagesForApi, temperature);

      if (!response.choices || response.choices.length === 0) {
        console.error('Invalid response from backend:', response);
        setError('Received an invalid response from the server.');
        setIsLoading(false);
        return;
      }

      const { message, logprobs } = response.choices[0];
      const { content } = message;

      const processedTokens = logprobs.content.map(logprob => ({
        token: logprob.token,
        probability: Math.exp(logprob.logprob),
        alternatives: logprob.top_logprobs.map(top_logprob => ({
          token: top_logprob.token,
          probability: Math.exp(top_logprob.logprob)
        }))
      }));

      const assistantMessage = {
        type: 'assistant',
        tokens: processedTokens,
        content: content
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const lastMessage = messages.length > 0 && messages[messages.length - 1].type === 'assistant'
    ? messages[messages.length - 1]
    : null;

  return (
    <div className="chat-container">
      <Header
        temperature={temperature}
        setTemperature={setTemperature}
        stepMode={stepMode}
        setStepMode={setStepMode}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        lastMessage={lastMessage}
      />
      <div className="main-content">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          setCurrentStep={setCurrentStep}
          stepMode={stepMode}
          currentStep={currentStep}
        />
        {stepMode && lastMessage && (
          <TokenProbChart lastMessage={lastMessage} currentStep={currentStep} />
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      <ChatInput
        prompt={prompt}
        setPrompt={setPrompt}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
      />
      <div className="uu-footer">
        <div className="uu-footer-content">
          <p>© Uppsala universitet 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;