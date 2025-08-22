'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { chatbotEngine, type ChatMessage, type ChatSession } from '@/lib/chatbot/chatbot-engine';
import { businessTracker } from '@/lib/tracking/google-ads';

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session when opened
  useEffect(() => {
    if (isOpen && !session) {
      const newSession = chatbotEngine.createSession();
      setSession(newSession);
      setMessages(newSession.messages);
      
      // Track chatbot interaction
      businessTracker.trackServiceInterest('AI Chatbot');
    }
  }, [isOpen, session]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      // Process message through chatbot engine
      const newMessages = chatbotEngine.processMessage(session.id, userMessage);
      
      // Update messages with slight delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, ...newMessages]);
        setIsTyping(false);
      }, 500);

      // Track chat engagement
      if (userMessage.toLowerCase().includes('quote') || 
          userMessage.toLowerCase().includes('price')) {
        businessTracker.trackServiceInterest('Chatbot Quote Interest');
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: "I'm having trouble right now. Please call us at (406) 555-0123 or use our quote form above! 📞",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Track chatbot opening
      businessTracker.trackCTAClick('Chatbot', 'Bottom Right');
    }
  };

  const handleQuickAction = (action: string) => {
    const quickActions: Record<string, string> = {
      quote: "I'd like to get a quote for my drywall project",
      services: "What services do you offer?",
      emergency: "I need emergency drywall repair",
      appointment: "I'd like to schedule a consultation",
      pricing: "How much do your services cost?",
      contact: "I'd like to speak with someone"
    };

    if (quickActions[action]) {
      setInputValue(quickActions[action]);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to JSX
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bullet points
        if (line.startsWith('•') || line.startsWith('-')) {
          return (
            <div key={index} className="flex items-start space-x-2 my-1">
              <span className="text-green-600 mt-1">•</span>
              <span>{line.substring(1).trim()}</span>
            </div>
          );
        }
        
        // Handle bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <div key={index} className="my-1">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          );
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }
        
        // Regular line
        return <div key={index} className="my-1">{line}</div>;
      });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">CF</span>
              </div>
              <div>
                <h3 className="font-semibold">Curl Feather Assistant</h3>
                <p className="text-xs text-green-100">Usually replies instantly</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.sender === 'bot' ? (
                      <div className="space-y-1">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions (show on first load) */}
              {messages.length <= 1 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 mt-3"
                >
                  <button
                    onClick={() => handleQuickAction('quote')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                  >
                    Get Quote 📋
                  </button>
                  <button
                    onClick={() => handleQuickAction('services')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                  >
                    Our Services 🔧
                  </button>
                  <button
                    onClick={() => handleQuickAction('emergency')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs hover:bg-red-200 transition-colors"
                  >
                    Emergency 🚨
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Contact Options */}
              <div className="flex justify-center space-x-4 mt-2 text-xs text-gray-500">
                <a
                  href="tel:(406) 555-0123"
                  className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                  onClick={() => businessTracker.trackPhoneClick('chatbot')}
                >
                  <PhoneIcon className="h-3 w-3" />
                  <span>Call</span>
                </a>
                <a
                  href="mailto:info@curlfeather.com"
                  className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                  onClick={() => businessTracker.trackEmailClick('chatbot')}
                >
                  <EnvelopeIcon className="h-3 w-3" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Badge */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
        >
          💬
        </motion.div>
      )}
    </div>
  );
}