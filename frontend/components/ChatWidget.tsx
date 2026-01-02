'use client';
import { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://benefitnest-backend.onrender.com';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: { text: string; action?: string }[];
  isEscalation?: boolean;
  contact?: { name: string; email: string; phone: string };
  suggestedCard?: { id: string; name: string; icon: string; path: string };
  moduleStatus?: { configured: string[]; notConfigured: string[] };
}

interface ChatWidgetProps {
  userType?: 'employee' | 'admin' | 'hr';
  userId?: string;
  userEmail?: string;
  userName?: string;
  tenantId?: string;
  tenantCode?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

export default function ChatWidget({
  userType = 'employee',
  userId,
  userEmail,
  userName,
  tenantId,
  tenantCode,
  position = 'bottom-right',
  primaryColor = '#6366f1'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Start conversation
  const startConversation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chatbot/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          userId,
          userEmail,
          userName,
          tenantId,
          tenantCode,
          channel: 'web'
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setConversationId(data.conversation.id);
        setSessionId(data.conversation.sessionId);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
          quickReplies: data.message.quickReplies
        }]);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setMessages([{
        id: 'error',
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  // Open chat
  const handleOpen = async () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
    
    if (!conversationId) {
      await startConversation();
    }
  };

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sessionId,
          message: messageText,
          tenantCode
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString() + '_ai',
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
          quickReplies: data.message.quickReplies,
          isEscalation: data.message.isEscalation,
          contact: data.message.contact,
          suggestedCard: data.suggestedCard,
          moduleStatus: data.moduleStatus
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick reply click
  const handleQuickReply = (reply: { text: string; action?: string }) => {
    if (reply.action === 'email' && messages[messages.length - 1]?.contact?.email) {
      window.location.href = `mailto:${messages[messages.length - 1].contact!.email}`;
    } else if (reply.action === 'call' && messages[messages.length - 1]?.contact?.phone) {
      window.location.href = `tel:${messages[messages.length - 1].contact!.phone}`;
    } else {
      sendMessage(reply.text);
    }
  };

  // Handle escalation
  const handleEscalate = async (method: 'email' | 'whatsapp' | 'call') => {
    try {
      const res = await fetch(`${API_BASE}/api/chatbot/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          method,
          userMessage: messages.filter(m => m.role === 'user').map(m => m.content).join(' '),
          userEmail,
          tenantCode
        })
      });

      const data = await res.json();

      if (data.success) {
        if (method === 'whatsapp' && data.escalation.action?.link) {
          window.open(data.escalation.action.link, '_blank');
        } else if (method === 'call' && data.escalation.action?.phone) {
          window.location.href = `tel:${data.escalation.action.phone}`;
        }
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.escalation.message,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error('Escalation error:', err);
    }
  };

  // End conversation with rating
  const endConversation = async (rating: number) => {
    try {
      await fetch(`${API_BASE}/api/chatbot/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, rating })
      });

      setShowRating(false);
      setMessages(prev => [...prev, {
        id: 'thanks',
        role: 'assistant',
        content: 'Thank you for your feedback! Have a great day! 👋',
        timestamp: new Date()
      }]);

      setTimeout(() => {
        setIsOpen(false);
        setConversationId(null);
        setMessages([]);
      }, 2000);
    } catch (err) {
      console.error('Error ending conversation:', err);
    }
  };

  // Position styles - responsive positioning
  const positionClasses = position === 'bottom-right' 
    ? 'right-3 sm:right-4 md:right-6 bottom-3 sm:bottom-4 md:bottom-6'
    : 'left-3 sm:left-4 md:left-6 bottom-3 sm:bottom-4 md:bottom-6';

  if (!isOpen) {
    // Floating button
    return (
      <button
        onClick={handleOpen}
        className={`fixed ${positionClasses} w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] rounded-full border-none shadow-lg cursor-pointer flex items-center justify-center z-[9999] transition-transform duration-200 hover:scale-110 hover:shadow-xl`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
        }}
      >
        <span className="text-xl sm:text-2xl md:text-3xl">💬</span>
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    );
  }

  // Chat window
  return (
    <div
      className={`fixed ${positionClasses} bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] transition-all duration-300`}
      style={{
        width: isMinimized ? 'min(280px, calc(100vw - 24px))' : 'min(380px, calc(100vw - 24px))',
        height: isMinimized ? 56 : 'min(520px, calc(100vh - 100px))',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-between cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg sm:text-2xl">🤖</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm sm:text-base">
              BenefitNest Assistant
            </div>
            <div className="text-white/80 text-xs">
              {isLoading ? 'Typing...' : 'Online'}
            </div>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="bg-white/20 border-none rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 cursor-pointer text-white text-xs sm:text-sm"
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowRating(true); }}
            className="bg-white/20 border-none rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 cursor-pointer text-white text-xs sm:text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? primaryColor : 'white',
                      color: msg.role === 'user' ? 'white' : '#1f2937',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Quick Replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 8, 
                    marginTop: 8,
                    paddingLeft: 4
                  }}>
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(qr)}
                        style={{
                          padding: '8px 14px',
                          background: 'white',
                          border: `1px solid ${primaryColor}`,
                          borderRadius: 20,
                          color: primaryColor,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = primaryColor;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = primaryColor;
                        }}
                      >
                        {qr.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Escalation Contact Card */}
                {msg.isEscalation && msg.contact && (
                  <div style={{
                    marginTop: 12,
                    padding: 16,
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>📞 Contact Support</div>
                    <div style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
                      <div><strong>{msg.contact.name}</strong></div>
                      <div>📧 {msg.contact.email}</div>
                      {msg.contact.phone && <div>📱 {msg.contact.phone}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleEscalate('email')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        ✉️ Email
                      </button>
                      {msg.contact.phone && (
                        <>
                          <button
                            onClick={() => handleEscalate('whatsapp')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 13
                            }}
                          >
                            💬 WhatsApp
                          </button>
                          <button
                            onClick={() => handleEscalate('call')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 13
                            }}
                          >
                            📞 Call
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Card Navigation Suggestion */}
                {msg.suggestedCard && (
                  <div style={{
                    marginTop: 12,
                    padding: 16,
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: 12,
                    border: '1px solid #bae6fd',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#0369a1' }}>
                      🎯 Suggested Module
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      marginBottom: 12 
                    }}>
                      <span style={{ fontSize: 32 }}>{msg.suggestedCard.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0c4a6e' }}>
                          {msg.suggestedCard.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {msg.suggestedCard.path}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = msg.suggestedCard!.path;
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: '#0284c7',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      Go to {msg.suggestedCard.name} →
                    </button>
                  </div>
                )}

                {/* Module Status Display */}
                {msg.moduleStatus && (
                  <div style={{
                    marginTop: 12,
                    padding: 16,
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>📊 Module Status</div>
                    {msg.moduleStatus.configured.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>
                          ✅ Configured
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.moduleStatus.configured.map((mod, idx) => (
                            <span key={idx} style={{
                              padding: '4px 10px',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: 12,
                              fontSize: 12
                            }}>
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.moduleStatus.notConfigured.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>
                          ❌ Not Configured
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.moduleStatus.notConfigured.map((mod, idx) => (
                            <span key={idx} style={{
                              padding: '4px 10px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: 12,
                              fontSize: 12
                            }}>
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 20px',
                  background: 'white',
                  borderRadius: '16px 16px 16px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className="typing-dot" style={{ animationDelay: '0s' }}>•</span>
                    <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
                    <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rating Modal */}
          {showRating && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}>
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 300,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  How was your experience?
                </div>
                <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
                  Your feedback helps us improve
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => endConversation(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 32,
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setShowRating(false); setIsOpen(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Skip & Close
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: 16,
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: 10
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 24,
                outline: 'none',
                fontSize: 14,
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: inputValue.trim() ? primaryColor : '#e5e7eb',
                border: 'none',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: 18, color: 'white' }}>➤</span>
            </button>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        .typing-dot {
          font-size: 24px;
          color: #9ca3af;
          animation: typingDot 1.4s infinite;
        }
      `}</style>
    </div>
  );
}
