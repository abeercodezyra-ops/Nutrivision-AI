import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, TrendingUp, Lightbulb, History, ChevronRight, Zap, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { mealsAPI } from '../utils/api';

export function HomeScreen({ onNavigate, isDarkMode, userName }) {
  const [stats, setStats] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated before loading data
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, redirecting to login');
      onNavigate('login');
      return;
    }
    
    loadStats();
    loadRecentMeals();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token available for stats');
        setStats({
          totalMeals: 0,
          totalCalories: 0,
          avgCalories: 0,
          weeklyMeals: 0,
          streak: 0
        });
        return;
      }

      const response = await mealsAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      
      // If token is invalid, redirect to login
      if (error.message && (error.message.includes('token') || error.message.includes('Unauthorized'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onNavigate('login');
        return;
      }
      
      // Set default stats if API fails
      setStats({
        totalMeals: 0,
        totalCalories: 0,
        avgCalories: 0,
        weeklyMeals: 0,
        streak: 0
      });
    }
  };

  const loadRecentMeals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token available for recent meals');
        setRecentMeals([]);
        setIsLoading(false);
        return;
      }

      const response = await mealsAPI.getHistory();
      if (response.success && response.data && response.data.length > 0) {
        // Get last 3 meals
        const recent = response.data.slice(0, 3).map(meal => ({
          name: meal.name || 'Meal',
          image: meal.image || '',
          calories: meal.calories || 0,
          time: formatTimeAgo(meal.date || meal.createdAt)
        }));
        setRecentMeals(recent);
      } else {
        // No meals yet
        setRecentMeals([]);
      }
    } catch (error) {
      console.error('Failed to load recent meals:', error);
      
      // If token is invalid, redirect to login
      if (error.message && (error.message.includes('token') || error.message.includes('Unauthorized'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onNavigate('login');
        return;
      }
      
      // No fake data - show empty state
      setRecentMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    {
      icon: Camera,
      title: 'Scan Meal',
      description: 'Take a photo and get instant nutrition analysis',
      gradient: 'from-orange-500 to-yellow-500',
      onClick: () => onNavigate('scan')
    },
    {
      icon: TrendingUp,
      title: 'Insights',
      description: 'Track your nutrition trends and progress',
      gradient: 'from-blue-500 to-cyan-500',
      onClick: () => onNavigate('history')
    },
    {
      icon: Lightbulb,
      title: 'Diet Tips',
      description: 'Get personalized recommendations from AI',
      gradient: 'from-green-500 to-emerald-500',
      onClick: () => onNavigate('recommendations')
    },
    {
      icon: History,
      title: 'History',
      description: 'View your meal tracking history',
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => onNavigate('history')
    }
  ];


  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-lg bg-gradient-to-br from-orange-500/90 to-yellow-500/90 rounded-3xl p-8 sm:p-10 shadow-2xl mb-8 relative overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          </div>

          <div className="relative z-10">
            <h2 className="font-['Poppins'] text-white mb-3">
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl">
              Ready to analyze your meal? Upload an image and get instant nutrition insights powered by AI.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('scan')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all font-['Poppins']"
            >
              <Camera className="w-5 h-5" />
              <span>Upload Image / Scan Meal</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Calories', value: stats?.totalCalories?.toLocaleString() || '0', icon: '🔥', color: 'from-orange-500 to-yellow-500' },
            { label: 'Streak Days', value: stats?.streak?.toString() || '0', icon: '⚡', color: 'from-purple-500 to-pink-500' },
            { label: 'Meals Scanned', value: stats?.totalMeals?.toString() || '0', icon: '🍽️', color: 'from-blue-500 to-cyan-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-6">Quick Access</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={category.onClick}
                className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all text-left group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Poppins'] text-gray-900 dark:text-white">Recent Scans</h3>
            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-white/50 dark:border-slate-700/50 shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-slate-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentMeals.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentMeals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => onNavigate('history')}
                  className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-slate-700">
                    {meal.image ? (
                      <ImageWithFallback
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-slate-700 dark:to-slate-800">
                        <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    {meal.calories > 0 && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full">
                        <span className="font-['Roboto_Mono'] text-sm">{meal.calories} kcal</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-1">
                      {meal.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{meal.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-12 border border-white/50 dark:border-slate-700/50 shadow-lg text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                No meals scanned yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start tracking your nutrition by scanning your first meal!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('scan')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-['Poppins']"
              >
                <Camera className="w-5 h-5" />
                <span>Scan Your First Meal</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Featured Tips */}
        {stats && stats.streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                  💡 Daily Tip
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {stats.streak > 0 
                    ? `Great job staying consistent! You're on a ${stats.streak}-day tracking streak. Keep scanning your meals to maintain your progress and achieve your nutrition goals! 🔥`
                    : 'Start tracking your meals daily to build a healthy habit and achieve your nutrition goals!'}
                </p>
                {stats.streak >= 7 && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-300">Achievement unlocked!</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

