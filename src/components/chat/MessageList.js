import React, { useRef, useEffect } from 'react';
import Message from './Message';

const MessageList = ({ messages, isLoading, setCurrentStep, stepMode, currentStep }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="messages-container">
            {messages.map((message, index) => (
                <Message
                    key={index}
                    message={message}
                    setCurrentStep={setCurrentStep}
                    stepMode={stepMode}
                    currentStep={currentStep}
                />
            ))}
            {isLoading && (
                <div className="message assistant">
                    <div className="message-header">Assistant</div>
                    <div className="message-content typing">Typing...</div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
