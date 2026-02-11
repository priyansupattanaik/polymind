
import { useState, useRef, useEffect, useCallback } from 'react';
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

const DEFAULT_ACTIVE_MODELS = ['groq-qwen', 'groq-versatile', 'groq-gptoss', 'nvidia-deepseek', 'or-aurora', 'or-trinity', 'or-liquid'];

let nextConversationId = 1;

const createConversation = () => ({
  id: nextConversationId++,
  title: 'New Chat',
  messages: [],
  createdAt: Date.now(),
});

export const useChat = () => {
  const [conversations, setConversations] = useState(() => [createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [activeModels, setActiveModels] = useState(DEFAULT_ACTIVE_MODELS);
  const [dreamMode, setDreamMode] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef(null);

  // Derived: current conversation's messages
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];

  const toggleModel = (id) => {
    setActiveModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleDreamMode = () => setDreamMode(prev => !prev);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  // Update messages for the active conversation
  const updateActiveMessages = useCallback((updater) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: typeof updater === 'function' ? updater(conv.messages) : updater }
          : conv
      )
    );
  }, [activeConversationId]);

  // Auto-title: set title from the first user message
  const updateTitle = useCallback((text) => {
    const title = text.length > 35 ? text.slice(0, 35) + '…' : text;
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId && conv.title === 'New Chat'
          ? { ...conv, title }
          : conv
      )
    );
  }, [activeConversationId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    updateActiveMessages(prev => [...prev, userMessage]);
    updateTitle(input.trim());
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.post(`${apiUrl}/council`, {
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

      updateActiveMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with council:", error);
      
      // Detailed logging for debugging
      if (error.response) {
          console.error("Response Data:", error.response.data);
          console.error("Response Status:", error.response.status);
          console.error("Response Headers:", error.response.headers);
      } else if (error.request) {
          console.error("Request made but no response received:", error.request);
      } else {
          console.error("Error Message:", error.message);
      }

      let errorMessage = "The Council is currently unavailable. Please check the backend connection.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Error ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response received from the Council. Please check your network connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Error: ${error.message}`;
      }

      updateActiveMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Start a new conversation
  const startNewChat = useCallback(() => {
    const newConv = createConversation();
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInput('');
    setLoading(false);
  }, []);

  // Switch to an existing conversation
  const switchConversation = useCallback((id) => {
    if (id !== activeConversationId) {
      setActiveConversationId(id);
      setInput('');
      setLoading(false);
    }
  }, [activeConversationId]);

  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const remaining = prev.filter(c => c.id !== id);
      // If deleting the active one, switch to the first remaining or create new
      if (id === activeConversationId) {
        if (remaining.length === 0) {
          const newConv = createConversation();
          setActiveConversationId(newConv.id);
          return [newConv];
        }
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
  }, [activeConversationId]);

  return {
    // Current chat
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
    sendMessage,
    // Multi-conversation
    conversations,
    activeConversationId,
    startNewChat,
    switchConversation,
    deleteConversation,
  };
};
