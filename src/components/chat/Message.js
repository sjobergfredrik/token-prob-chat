import React from 'react';
import Token from './Token';

const Message = ({ message, setCurrentStep, stepMode, currentStep }) => {
    const tokensToRender =
        message.type === 'assistant' && stepMode
            ? message.tokens.slice(0, currentStep + 1)
            : message.tokens;

    return (
        <div className={`message ${message.type}`}>
            <div className="message-header">{message.type === 'user' ? 'You' : 'Assistant'}</div>
            <div className="message-content">
                {message.type === 'user' ? (
                    message.content
                ) : (
                    <div className="tokens-container">
                        {tokensToRender.map((token, index) => (
                            <Token key={index} token={token} setCurrentStep={setCurrentStep} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;
