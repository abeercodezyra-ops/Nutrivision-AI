import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Edit, Settings, Moon, Sun, LogOut, Target, Award, Camera, Bell, X, Save, Check } from 'lucide-react';
import { mealsAPI } from '../utils/api';

export function ProfileScreen({ onNavigate, isDarkMode, toggleDarkMode, onLogout, userName }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [arMode, setArMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
    loadStats();
    loadSettings();
  }, []);

  const loadUserData = () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setEditName(userData.name || '');
        setEditEmail(userData.email || '');
        
        // Load profile image if exists
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
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
      setStats({ totalMeals: 0, streak: 0, totalCalories: 0, avgCalories: 0 });
    }
  };

  const loadSettings = () => {
    const savedTarget = localStorage.getItem('calorieTarget');
    if (savedTarget) {
      setCalorieTarget(Number(savedTarget));
    }
    const savedArMode = localStorage.getItem('arMode');
    if (savedArMode === 'true') {
      setArMode(true);
    }
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    if (savedNotifications === 'false') {
      setNotificationsEnabled(false);
    }
  };

  const handleCalorieTargetChange = (e) => {
    const newTarget = Number(e.target.value);
    setCalorieTarget(newTarget);
    localStorage.setItem('calorieTarget', newTarget.toString());
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (editName.trim() && editEmail.trim()) {
      const updatedUser = {
        ...user,
        name: editName.trim(),
        email: editEmail.trim().toLowerCase()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      // Reload page to update userName in App.jsx
      window.location.reload();
    }
  };

  const handleArModeToggle = () => {
    const newArMode = !arMode;
    setArMode(newArMode);
    localStorage.setItem('arMode', newArMode.toString());
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
  };

  const calculateAchievements = () => {
    const totalMeals = stats?.totalMeals || 0;
    const streak = stats?.streak || 0;
    const totalCalories = stats?.totalCalories || 0;

    return [
      { emoji: '🔥', label: `${streak}-Day Streak`, unlocked: streak >= 1 },
      { emoji: '⭐', label: 'First Scan', unlocked: totalMeals >= 1 },
      { emoji: '🏆', label: '50 Meals', unlocked: totalMeals >= 50 },
      { emoji: '💪', label: '100 Meals', unlocked: totalMeals >= 100 },
      { emoji: '🎯', label: '10K Calories', unlocked: totalCalories >= 10000 },
      { emoji: '🌟', label: '7-Day Streak', unlocked: streak >= 7 },
      { emoji: '👑', label: '30-Day Streak', unlocked: streak >= 30 },
      { emoji: '💎', label: '200 Meals', unlocked: totalMeals >= 200 }
    ];
  };

  const userEmail = user?.email || 'user@nutrivision.ai';
  const displayName = user?.name || userName;
  const initials = displayName.charAt(0).toUpperCase();
  const achievements = calculateAchievements();

  if (isLoading) {
    return (
      <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-xl mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {profileImage ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl">
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-2xl">
                  <span className="font-['Poppins'] text-4xl">{initials}</span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-['Poppins'] text-gray-900 dark:text-white mb-2 text-2xl">
                {displayName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {userEmail}
              </p>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all mx-auto sm:mx-0"
              >
                <Edit className="w-4 h-4" />
                <span className="font-['Poppins']">Edit Profile</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Streak</p>
                <p className="font-['Roboto_Mono'] text-orange-500 text-xl">{stats?.streak || 0} days</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Scans</p>
                <p className="font-['Roboto_Mono'] text-orange-500 text-xl">{stats?.totalMeals || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Calorie Target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-['Poppins'] text-gray-900 dark:text-white">Daily Calorie Target</h3>
              <p className="text-gray-600 dark:text-gray-300">Customize your nutrition goals</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Target</span>
                <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white text-lg">{calorieTarget.toLocaleString()} kcal</span>
              </div>
              <input
                type="range"
                min="1200"
                max="3500"
                step="50"
                value={calorieTarget}
                onChange={handleCalorieTargetChange}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${((calorieTarget - 1200) / (3500 - 1200)) * 100}%, #e5e7eb ${((calorieTarget - 1200) / (3500 - 1200)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1,200</span>
                <span>3,500</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg mb-6"
        >
          <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-4">Settings</h3>
          <div className="space-y-3">
            {/* Preferences */}
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">Preferences</span>
              <span className="text-gray-400">›</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">Notifications</span>
              <span className="text-gray-400">›</span>
            </button>

            {/* Dark Mode */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              {isDarkMode ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              <span className="flex-1 text-gray-900 dark:text-white">Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isDarkMode ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: isDarkMode ? 28 : 2 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            {/* AR Mode */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="flex-1 text-gray-900 dark:text-white">AR Mode</span>
              <button
                onClick={handleArModeToggle}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  arMode ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: arMode ? 28 : 2 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-lg mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-orange-500" />
            <h3 className="font-['Poppins'] text-gray-900 dark:text-white">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl text-center transition-all cursor-pointer ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/50'
                    : 'bg-gray-100 dark:bg-slate-700/50 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.emoji}</div>
                <p className="text-gray-900 dark:text-white text-sm">{achievement.label}</p>
                {achievement.unlocked && (
                  <Check className="w-4 h-4 text-green-500 mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-['Poppins']">Logout</span>
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-lg bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/50 dark:border-slate-700/50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Poppins'] text-gray-900 dark:text-white text-xl">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span className="font-['Poppins']">Save Changes</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferencesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreferencesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-lg bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/50 dark:border-slate-700/50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Poppins'] text-gray-900 dark:text-white text-xl">Preferences</h3>
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-gray-900 dark:text-white">Dark Mode</span>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isDarkMode ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isDarkMode ? 28 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-gray-900 dark:text-white">AR Mode</span>
                  <button
                    onClick={handleArModeToggle}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      arMode ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: arMode ? 28 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotificationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotificationsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-lg bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/50 dark:border-slate-700/50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Poppins'] text-gray-900 dark:text-white text-xl">Notifications</h3>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-gray-900 dark:text-white">Enable Notifications</span>
                  <button
                    onClick={handleNotificationsToggle}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationsEnabled ? 28 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications about meal reminders, achievements, and nutrition tips.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

