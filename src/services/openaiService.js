import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const COMPLETIONS_URL = 'https://api.openai.com/v1/completions';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Gets both a high-quality response and token probabilities using a hybrid approach
 * @param {string} prompt - The user's input prompt
 * @param {number} maxTokens - Maximum number of tokens to generate
 * @param {number} temperature - Controls randomness (0-1)
 * @param {number} logprobs - Number of most likely tokens to return
 * @returns {Promise} - The API response
 */
export const getCompletion = async (prompt, maxTokens = 150, temperature = 0.3, logprobs = 5) => {
  try {
    // First, get the high-quality response from gpt-4o-mini
    const chatResponse = await axios.post(
      CHAT_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
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