# Token Probability Chat

An interactive chat interface that visualizes token-level probabilities from language models, helping users understand AI response confidence and decision-making processes. The application uses a hybrid approach to deliver both high-quality responses and detailed probability analysis.

## Key Features

### 🎯 Hybrid Model Approach
- **Response Generation**: Uses `gpt-4o-mini` for high-quality, context-aware responses
- **Probability Analysis**: Uses `gpt-3.5-turbo-instruct` to extract token-level probabilities
- Combines the best of both models: quality responses with detailed probability insights

### 💬 Conversation History
- Maintains full conversation context across multiple turns
- System prompt ensures context-aware responses
- Clean token handling for seamless multi-turn conversations

### 📊 Visual Probability Indicators
- **Color-coded tokens** based on model confidence:
  - 🟢 Green: High confidence (≥50%)
  - 🟡 Yellow: Medium confidence (20-49%)
  - 🔴 Red: Low confidence (<20%)
- **Interactive tooltips** showing:
  - Token probability percentages
  - Alternative token suggestions
  - Visual indicators for strong alternatives

### 🔍 Advanced Analysis
- Click any token to explore alternatives
- Visual highlighting of tokens with competitive alternatives
- Real-time probability calculations from log-probabilities

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd token-prob-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API access**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your message in the input field
2. Submit to receive an AI response
3. Observe color-coded tokens indicating confidence levels
4. Hover over tokens to see detailed probability information and alternatives
5. Continue the conversation - context is maintained automatically

## Technical Architecture

### API Integration
- **Dual API calls** for optimal results:
  1. Chat Completions API (`gpt-4o-mini`) for response quality
  2. Completions API (`gpt-3.5-turbo-instruct`) for probability data
- Automatic log-probability to probability conversion
- Configurable temperature and token limits

### Frontend Stack
- **React** for UI components
- **Tippy.js** for interactive tooltips
- **Axios** for API requests
- **React Force Graph** and **Recharts** for visualization capabilities

### Data Processing
- Converts log-probabilities using `Math.exp()` for interpretable percentages
- Handles token encoding (removes GPT tokenization artifacts like `Ġ` and `▁`)
- Processes top-k alternative tokens for each position

## Configuration

The application supports several parameters (configurable in `openaiService.js`):

- `maxTokens`: Maximum response length (default: 150)
- `temperature`: Response randomness 0-1 (default: 0.3)
- `logprobs`: Number of alternative tokens to retrieve (default: 5)

## Use Cases

- **Education**: Understand how language models make decisions
- **Research**: Analyze model confidence and uncertainty
- **Development**: Debug and improve prompt engineering
- **Transparency**: Visualize AI decision-making processes

## Requirements

- Node.js 14+ 
- OpenAI API key with access to:
  - `gpt-4o-mini` model
  - `gpt-3.5-turbo-instruct` model

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

Copyright (c) 2025 Fredrik Sjöberg
