import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatbotAPI } from '../utils/api';

export function ChatbotFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi there! 👋 I'm NutriAI, your expert food analysis and nutrition assistant. I can help you analyze foods, estimate calories, provide nutrition breakdowns, and give health guidance. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-2xl hover:shadow-orange-500/50 transition-all group"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 rounded-full bg-orange-500 opacity-30 blur-md"
        />
        <div className="relative z-10">
          {isOpen ? (
            <X className="w-7 h-7 mx-auto" />
          ) : (
            <MessageCircle className="w-7 h-7 mx-auto" />
          )}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Poppins'] text-white">NutriAI</h3>
                    <p className="text-white/80">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
                      className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`flex-1 max-w-[85%] rounded-2xl p-3 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-tr-none' 
                          : 'bg-gray-100 dark:bg-slate-800 rounded-tl-none text-gray-900 dark:text-white'
                      }`}>
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {msg.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!message.trim() || isLoading) return;

                    const userMessage = message.trim();
                    setMessage('');
                    
                    // Add user message
                    setMessages(prev => [...prev, {
                      role: 'user',
                      text: userMessage,
                      timestamp: new Date().toISOString()
                    }]);

                    setIsLoading(true);

                    try {
                      // Get conversation history
                      const conversationHistory = messages.map(msg => ({
                        role: msg.role === 'bot' ? 'assistant' : 'user',
                        content: msg.text
                      }));

                      // Call chatbot API
                      const response = await chatbotAPI.sendMessage(userMessage, conversationHistory);
                      
                      // Add bot response
                      setMessages(prev => [...prev, {
                        role: 'bot',
                        text: response.data.message,
                        timestamp: response.data.timestamp
                      }]);
                    } catch (error) {
                      console.error('Chatbot error:', error);
                      setMessages(prev => [...prev, {
                        role: 'bot',
                        text: error.message?.includes('Backend server') 
                          ? 'Backend server is not running. Please start the server on port 5001.'
                          : 'Sorry, I encountered an error. Please try again.',
                        timestamp: new Date().toISOString()
                      }]);
                    } finally {
                      setIsLoading(false);
                      inputRef.current?.focus();
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const form = e.target.closest('form');
                        if (form && !isLoading && message.trim()) {
                          form.requestSubmit();
                        }
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

