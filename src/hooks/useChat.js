
import { useState, useRef, useLayoutEffect } from 'react';
import axios from 'axios';

const AVAILABLE_MODELS = [
  { id: 'groq-qwen', name: 'Qwen 3 32B (Groq)' },
  { id: 'groq-gptoss', name: 'GPT OSS 20B (Groq)' },
  { id: 'groq-versatile', name: 'Llama 3.3 70B (Groq)' },
  { id: 'nvidia-deepseek', name: 'DeepSeek V3.1 (Nvidia)' },
  { id: 'or-aurora', name: 'Aurora Alpha (OpenRouter)' },
  { id: 'or-trinity', name: 'Trinity Large Preview (OpenRouter)' },
  { id: 'or-liquid', name: 'Liquid LFM 2.5 (OpenRouter)' },
  { id: 'or-seed', name: 'Seedream 4.5 (OpenRouter)' },
];

export const useChat = () => {
  const [activeModels, setActiveModels] = useState(['groq-qwen', 'groq-versatile', 'groq-gptoss', 'nvidia-deepseek', 'or-aurora', 'or-trinity', 'or-liquid']);
  const [dreamMode, setDreamMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef(null);

  const toggleModel = (id) => {
    setActiveModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleDreamMode = () => setDreamMode(prev => !prev);

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
      const response = await axios.post('/api/council', {
        prompt: userMessage.content,
        active_models: activeModels,
        dream_mode: dreamMode
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
    dreamMode,
    messageListRef,
    setInput,
    toggleModel,
    toggleDreamMode,
    sendMessage
  };
};
