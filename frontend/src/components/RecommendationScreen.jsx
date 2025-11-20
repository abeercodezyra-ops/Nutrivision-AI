import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, Bot, User, Sparkles, TrendingUp, Apple, Plus, ArrowRight } from 'lucide-react';
import { chatbotAPI } from '../utils/api';
import { mealsAPI } from '../utils/api';

export function RecommendationScreen({ onNavigate, isDarkMode }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi there! 👋 I'm NutriAI, your expert food analysis and nutrition assistant. I can help you analyze foods, estimate calories, provide nutrition breakdowns, and give health guidance. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'working', 'fallback'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    loadStats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatbotAPI.getSuggestions();
      if (response.success) {
        // Handle both string arrays and object arrays
        const suggestionsData = response.data || [];
        const formattedSuggestions = suggestionsData.map(suggestion => {
          // If it's an object, extract the text property
          if (typeof suggestion === 'object' && suggestion !== null) {
            return suggestion.text || suggestion.message || JSON.stringify(suggestion);
          }
          // If it's already a string, return as is
          return suggestion;
        });
        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([
        'What are the health benefits of this meal?',
        'Suggest a healthy snack',
        'How many calories should I eat today?',
        'What foods are high in protein?'
      ]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await mealsAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSendMessage = async (text = null) => {
    const messageText = text || message.trim();
    if (!messageText || isLoading) return;

    const userMessage = messageText;
    if (!text) setMessage('');
    
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
      
      // Check API status
      if (response.data.note) {
        setApiStatus('fallback');
        console.warn('⚠️ Using fallback response - Gemini API might not be working');
      } else {
        setApiStatus('working');
        console.log('✅ Gemini API response received successfully');
      }
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
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const [recommendedMeals, setRecommendedMeals] = useState([
    {
      emoji: '🥗',
      name: 'Light Garden Salad',
      calories: 120,
      protein: 8,
      carbs: 15,
      fats: 4,
      description: 'Mixed greens, cherry tomatoes, cucumber, balsamic vinegar',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      emoji: '🍌',
      name: 'Banana Protein Smoothie',
      calories: 150,
      protein: 12,
      carbs: 25,
      fats: 2,
      description: 'Banana, protein powder, almond milk, honey',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      emoji: '🥜',
      name: 'Mixed Nuts & Seeds',
      calories: 180,
      protein: 6,
      carbs: 8,
      fats: 15,
      description: 'Almonds, walnuts, pumpkin seeds, dried cranberries',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      emoji: '🍎',
      name: 'Apple with Peanut Butter',
      calories: 95,
      protein: 4,
      carbs: 18,
      fats: 3,
      description: 'Fresh apple slices with natural peanut butter',
      gradient: 'from-red-500 to-pink-500'
    }
  ]);

  const quickReplies = [
    { text: 'What are healthy snacks?', icon: Apple },
    { text: 'Show my progress', icon: TrendingUp },
    { text: 'Nutrition tips', icon: Sparkles }
  ];

  const handleAddMeal = async (meal) => {
    try {
      const mealData = {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        nutrients: {
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats
        }
      };
      const response = await mealsAPI.addMeal(mealData);
      if (response.success) {
        // Show success message
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `✅ Great! I've added "${meal.name}" to your meal history. It contains ${meal.calories} calories, ${meal.protein}g protein, ${meal.carbs}g carbs, and ${meal.fats}g fats.`,
          timestamp: new Date().toISOString()
        }]);
        // Reload stats
        loadStats();
      }
    } catch (error) {
      console.error('Failed to add meal:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Sorry, I couldn't add the meal. ${error.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="font-['Poppins'] text-gray-900 dark:text-white text-2xl mb-1">NutriAI Chat</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-300">Your AI nutrition assistant</p>
                  {apiStatus === 'working' && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      ✓ Gemini AI Active
                    </span>
                  )}
                  {apiStatus === 'fallback' && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                      ⚠ Fallback Mode
                    </span>
                  )}
                </div>
              </div>
              {stats && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today's Progress</p>
                  <p className="font-['Roboto_Mono'] text-orange-500 text-lg">{stats.totalCalories || 0} / 2,000 kcal</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-xl overflow-hidden"
        >
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-tl-none p-4">
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

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
            {/* Quick Suggestions */}
            {suggestions.length > 0 && messages.length === 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion, index) => {
                  // Handle both string and object suggestions
                  const suggestionText = typeof suggestion === 'string' 
                    ? suggestion 
                    : (suggestion?.text || suggestion?.message || '');
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestionText)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-all disabled:opacity-50"
                    >
                      {suggestionText}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Quick Reply Chips */}
            {messages.length > 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(reply.text)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <reply.icon className="w-4 h-4" />
                    <span>{reply.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about nutrition..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline font-['Poppins']">Send</span>
              </button>
            </form>
          </div>
        </motion.div>

        {/* Recommended Meals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-4 text-xl">
            Recommended Healthy Meals
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedMeals.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-5 border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meal.gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg`}>
                    {meal.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-1 text-lg">
                      {meal.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {meal.description}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-500">🔥</span>
                        <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white text-sm">{meal.calories} kcal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500">💪</span>
                        <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white text-sm">{meal.protein}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">🌾</span>
                        <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white text-sm">{meal.carbs}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">🥑</span>
                        <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white text-sm">{meal.fats}g</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMeal(meal)}
                    className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    title="Add to My Meals"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex gap-4"
        >
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all"
          >
            <span className="font-['Poppins']">View History</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('scan')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <span className="font-['Poppins']">Scan Meal</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

