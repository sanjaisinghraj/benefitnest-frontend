'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'https://benefitnest-backend.onrender.com';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  guardrail_triggered?: boolean;
}

const suggestedTopics = [
  { icon: '🏋️', label: 'Exercise tips', prompt: 'What are some simple exercises I can do at my desk?' },
  { icon: '😴', label: 'Better sleep', prompt: 'How can I improve my sleep quality?' },
  { icon: '🧘', label: 'Stress relief', prompt: 'What are quick stress relief techniques for work?' },
  { icon: '🥗', label: 'Healthy eating', prompt: 'Suggest some healthy snack options for the office' },
  { icon: '💧', label: 'Hydration', prompt: 'How much water should I drink daily and why?' },
  { icon: '🧠', label: 'Mental wellness', prompt: 'How can I practice mindfulness during a busy day?' }
];

const disclaimer = `I'm an AI wellness assistant here to provide general wellness information and support. 
I'm not a medical professional, and my suggestions should not replace professional medical advice. 
For any health concerns, please consult a healthcare provider.`;

export default function AIWellnessCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Generate session ID
    setSessionId(crypto.randomUUID());
    
    // Initial greeting
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `Hello! 👋 I'm your AI Wellness Coach. I'm here to help you with questions about nutrition, exercise, sleep, stress management, and overall wellbeing.\n\nHow can I assist you today?`,
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (customPrompt?: string) => {
    const userMessage = customPrompt || input.trim();
    if (!userMessage || loading) return;

    setInput('');
    setShowDisclaimer(false);

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      setLoading(true);

      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/wellness/coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          context: {
            previous_messages: messages.slice(-5).map(m => ({
              role: m.type,
              content: m.content
            }))
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          guardrail_triggered: data.guardrail_triggered
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Log to AI audit (done server-side)
      } else {
        // Fallback response if API fails
        const fallbackMsg: Message = {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: getFallbackResponse(userMessage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `Chat cleared. How can I help you today?`,
        timestamp: new Date()
      }
    ]);
    setShowDisclaimer(true);
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Wellness Coach</h3>
            <p className="text-xs text-gray-500">Powered by AI • All interactions logged</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          title="Clear chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <p>{disclaimer}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-teal-500 text-white'
                  : msg.type === 'system'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs text-gray-500">AI Coach</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.guardrail_triggered && (
                <p className="text-xs mt-2 text-blue-600 italic">
                  ℹ️ This response was moderated for safety
                </p>
              )}
              <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🤖</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSend(topic.prompt)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                <span>{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about wellness, nutrition, exercise, sleep..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 max-h-32"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI responses are logged for quality assurance. You can skip or ignore any suggestion.
        </p>
      </div>
    </div>
  );
}

// Fallback responses when API is unavailable
function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('exercise') || lowerMsg.includes('workout') || lowerMsg.includes('fitness')) {
    return `Great question about exercise! Here are some general tips:\n\n🏃 Start with 30 minutes of moderate activity most days\n🏋️ Include both cardio and strength training\n🧘 Don't forget stretching and flexibility\n⚡ Start small and gradually increase intensity\n\nWould you like more specific exercise recommendations?`;
  }
  
  if (lowerMsg.includes('sleep') || lowerMsg.includes('rest') || lowerMsg.includes('tired')) {
    return `Sleep is crucial for wellbeing! Here are some tips:\n\n😴 Aim for 7-9 hours per night\n📵 Avoid screens 1 hour before bed\n🌡️ Keep your room cool and dark\n⏰ Maintain a consistent sleep schedule\n☕ Limit caffeine after noon\n\nWould you like more sleep hygiene tips?`;
  }
  
  if (lowerMsg.includes('stress') || lowerMsg.includes('anxious') || lowerMsg.includes('overwhelmed')) {
    return `Managing stress is important. Here are some quick techniques:\n\n🧘 Deep breathing: 4 counts in, 7 hold, 8 out\n🚶 Take a short walk\n📝 Write down what's bothering you\n🎵 Listen to calming music\n💭 Practice mindfulness for 5 minutes\n\nRemember, if stress feels overwhelming, please reach out to a mental health professional.`;
  }
  
  if (lowerMsg.includes('water') || lowerMsg.includes('hydrat')) {
    return `Staying hydrated is essential!\n\n💧 Aim for 8 glasses (2 liters) daily\n🥤 Keep a water bottle at your desk\n⏰ Set reminders to drink water\n🍉 Eat water-rich fruits and vegetables\n☕ Limit caffeine and sugary drinks\n\nSigns of dehydration: headaches, fatigue, dry mouth. Drink up! 💧`;
  }
  
  if (lowerMsg.includes('eat') || lowerMsg.includes('diet') || lowerMsg.includes('nutrition') || lowerMsg.includes('food')) {
    return `Good nutrition fuels your body and mind:\n\n🥗 Fill half your plate with vegetables\n🍎 Eat a variety of colorful fruits\n🍗 Include lean proteins\n🌾 Choose whole grains\n🥜 Add healthy fats like nuts and olive oil\n\nWould you like specific meal ideas or tips?`;
  }
  
  return `Thank you for your question! While I'd love to provide a detailed response, I'm currently in offline mode.\n\nIn the meantime, here are some general wellness tips:\n\n✅ Stay hydrated\n✅ Get regular exercise\n✅ Prioritize sleep\n✅ Practice stress management\n✅ Eat a balanced diet\n\nPlease try again in a moment or ask about a specific topic!`;
}
