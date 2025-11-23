import React from 'react';
import { getColor } from './utils';
import logo from '../../uu-logo-red.svg';

const Header = ({
  temperature,
  setTemperature,
  stepMode,
  setStepMode,
  currentStep,
  setCurrentStep,
  lastMessage
}) => {
  const handleNext = () => {
    if (lastMessage && currentStep < lastMessage.tokens.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
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
        <div className="controls">
          <div className="temperature-slider">
            <label>Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
          {lastMessage && (
            <div className="step-controls">
              <label>
                Step Mode:
                <input
                  type="checkbox"
                  checked={stepMode}
                  onChange={(e) => setStepMode(e.target.checked)}
                />
              </label>
              {stepMode && (
                <>
                  <button onClick={handlePrev} disabled={currentStep === 0}>Previous</button>
                  <button onClick={handleNext} disabled={currentStep === lastMessage.tokens.length - 1}>Next</button>
                  <span>{`${currentStep + 1} / ${lastMessage.tokens.length}`}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.85) }}></span>
            <span>High confidence (≥70%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.5) }}></span>
            <span>Medium confidence (30-69%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getColor(0.15) }}></span>
            <span>Low confidence (&lt;30%)</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
