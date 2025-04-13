import { useState } from 'react';
import axios from 'axios';

const models = ['Gemini', 'Claude', 'ChatGPT', 'Grok (XAI)', 'Perplexity'];

function App() {
  const [selectedModel, setSelectedModel] = useState('ChatGPT');
  const [message, setMessage] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [responses, setResponses] = useState([]);

  const callOpenAI = async (message) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      return 'Error contacting ChatGPT.';
    }
  };

  const callClaude = async (message) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [{ role: 'user', content: message }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      return response.data.content[0].text;
    } catch (error) {
      return 'Error contacting Claude.';
    }
  };

  const callGemini = async (message) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: message }] }]
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      return 'Error contacting Gemini.';
    }
  };

  const sendMessage = async () => {
    setResponses([...responses, { from: 'You', text: message }]);
    const userMessage = message;
    setMessage('');
    let aiReply = 'Not implemented for this model yet.';

    try {
      if (selectedModel === 'ChatGPT') aiReply = await callOpenAI(userMessage);
      else if (selectedModel === 'Claude') aiReply = await callClaude(userMessage);
      else if (selectedModel === 'Gemini') aiReply = await callGemini(userMessage);
    } catch {
      aiReply = `Error with ${selectedModel} API.`;
    }

    const response = { from: selectedModel, text: aiReply };
    setResponses(prev => [...prev, response]);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-mono mb-6">OmniChat</h1>
      <div className="mb-4 w-full max-w-md">
        <h2 className="text-teal-400 mb-2 text-lg">Select AI Model</h2>
        <div className="space-y-2">
          {models.map(model => (
            <button
              key={model}
              className={\`w-full px-4 py-2 text-left rounded transition \${selectedModel === model ? 'bg-teal-600' : 'bg-gray-800 hover:bg-gray-700'}\`}
              onClick={() => setSelectedModel(model)}
            >
              {model}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-xl mt-4">
        <h2 className="text-teal-400 mb-2 text-lg">Chat with AI</h2>
        <input className="w-full p-2 mb-2 rounded bg-gray-800 border border-gray-600 text-white"
               placeholder="Enter message..." value={message}
               onChange={e => setMessage(e.target.value)} />
        <div className="flex space-x-2 mb-4">
          <input className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
                 placeholder="Enter image URL"
                 value={imageURL} onChange={e => setImageURL(e.target.value)} />
          <button className="bg-teal-600 px-4 py-2 rounded"
                  onClick={() => alert('Image URL set!')}>Set Image</button>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-700 px-4 py-2 rounded"
                  onClick={() => alert('Upload image feature coming soon')}>Upload Image</button>
          <button className="bg-teal-600 px-4 py-2 rounded" onClick={sendMessage}>Send Message</button>
          <button className="bg-gray-700 px-4 py-2 rounded"
                  onClick={() => { setMessage(''); setResponses([]); }}>Clear</button>
        </div>
        <div className="mt-6 space-y-2">
          {responses.map((res, idx) => (
            <div key={idx} className="bg-gray-800 p-3 rounded">
              <strong>{res.from}:</strong> {res.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
