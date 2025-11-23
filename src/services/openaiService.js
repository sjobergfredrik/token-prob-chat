const API_URL = 'http://localhost:3001/api/chat';

/**
 * Gets a completion from the backend service.
 * @param {Array} messages - The conversation history.
 * @param {number} temperature - Controls randomness (0-1).
 * @returns {Promise} - The API response.
 */
export const getCompletion = async (messages, temperature) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Response body is not JSON, use status text
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling backend API:', error.message);
    throw error;
  }
};