import React from 'react';

const ChatInput = ({ prompt, setPrompt, isLoading, handleSubmit }) => {
    return (
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
    );
};

export default ChatInput;
