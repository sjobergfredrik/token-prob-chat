import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const COMPLETIONS_URL = 'https://api.openai.com/v1/completions';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Gets both a high-quality response and token probabilities using a hybrid approach
 * @param {string} prompt - The user's input prompt
 * @param {Array} history - Previous chat messages
 * @param {number} maxTokens - Maximum number of tokens to generate
 * @param {number} temperature - Controls randomness (0-1)
 * @param {number} logprobs - Number of most likely tokens to return
 * @returns {Promise} - The API response
 */
export const getCompletion = async (prompt, history = [], maxTokens = 150, temperature = 0.3, logprobs = 5) => {
  try {
    // Convert history to chat format and clean up the tokens
    const messages = [
      // System message to set the context
      {
        role: 'system',
        content: 'You are a helpful assistant. Always maintain context from the conversation history when answering questions. If a question seems to reference previous messages, consider that context in your response.'
      },
      // Convert history messages
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.type === 'user' 
          ? msg.content 
          : msg.tokens
              .map(t => t.token.replace(/^Ġ/g, ' ').replace(/^▁/g, ' '))
              .join('')
              .trim()
      }))
    ];

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    // First, get the high-quality response from gpt-4o-mini
    const chatResponse = await axios.post(
      CHAT_URL,
      {
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Then, get probability analysis using gpt-3.5-turbo-instruct
    // For probabilities, we only use the current prompt to keep responses focused
    const formattedPrompt = prompt.startsWith(' ') ? prompt : ' ' + prompt;
    const probResponse = await axios.post(
      COMPLETIONS_URL,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: formattedPrompt,
        max_tokens: maxTokens,
        temperature,
        logprobs,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        echo: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    // Combine the responses - use the high-quality content but keep the probability data
    return {
      choices: [{
        text: chatResponse.data.choices[0].message.content,
        logprobs: probResponse.data.choices[0].logprobs
      }]
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw error;
  }
}; 