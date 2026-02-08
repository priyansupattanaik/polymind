
import { useState, useRef, useLayoutEffect } from 'react';
import axios from 'axios';

const AVAILABLE_MODELS = [
  { id: 'groq-qwen', name: 'Qwen 3 32B (Groq)' },
  { id: 'groq-llama8b', name: 'Llama 3.1 8B (Groq)' },
  { id: 'groq-llama17b', name: 'Llama 4 Scout (Groq)' },
  { id: 'groq-kimi', name: 'Kimi K2 (Groq)' },
  { id: 'groq-gptoss', name: 'GPT OSS 120B (Groq)' },
  { id: 'nvidia-minimax', name: 'Minimax M2.1 (Nvidia)' },
  { id: 'nvidia-step', name: 'Step 3.5 Flash (Nvidia)' },
  { id: 'nvidia-mistral', name: 'Devstral 123B (Nvidia)' },
  { id: 'openrouter-trinity', name: 'Trinity Large (OpenRouter)' },
];

export const useChat = () => {
  const [activeModels, setActiveModels] = useState(AVAILABLE_MODELS.map(m => m.id));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef(null);

  const toggleModel = (id) => {
    setActiveModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  useLayoutEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Updated endpoint to match new backend structure
      const response = await axios.post('http://localhost:8000/api/council', {
        prompt: userMessage.content,
        active_models: activeModels
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.unified_response,
        chairman: response.data.chairman_model,
        individual_responses: response.data.individual_responses || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with council:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "The Council is currently unavailable. Please check the backend connection." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeModels,
    availableModels: AVAILABLE_MODELS,
    messages,
    input,
    loading,
    messageListRef,
    setInput,
    toggleModel,
    sendMessage
  };
};
