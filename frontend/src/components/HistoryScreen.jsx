import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Download, Filter, Search, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mealsAPI } from '../utils/api';

export function HistoryScreen({ onNavigate, isDarkMode }) {
  const [mealHistory, setMealHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterCaloriesMin, setFilterCaloriesMin] = useState('');
  const [filterCaloriesMax, setFilterCaloriesMax] = useState('');

  useEffect(() => {
    loadMealHistory();
    loadStats();
  }, []);

  const loadMealHistory = async () => {
    try {
      const response = await mealsAPI.getHistory();
      if (response.success) {
        // Format meals for display
        const formattedMeals = response.data.map(meal => ({
          ...meal,
          date: formatDate(meal.date),
          time: formatTime(meal.date),
          originalDate: meal.date // Keep original for filtering
        }));
        setMealHistory(formattedMeals);
      }
    } catch (error) {
      console.error('Failed to load meal history:', error);
      setMealHistory([]);
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
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Filter meals based on search and filters
  const filteredMeals = useMemo(() => {
    let filtered = [...mealHistory];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.originalDate);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.originalDate);
        mealDate.setHours(23, 59, 59, 999);
        return mealDate <= toDate;
      });
    }

    // Calories filter
    if (filterCaloriesMin) {
      const min = Number(filterCaloriesMin);
      filtered = filtered.filter(meal => meal.calories >= min);
    }

    if (filterCaloriesMax) {
      const max = Number(filterCaloriesMax);
      filtered = filtered.filter(meal => meal.calories <= max);
    }

    return filtered;
  }, [mealHistory, searchQuery, filterDateFrom, filterDateTo, filterCaloriesMin, filterCaloriesMax]);

  // Calculate weekly data from real meal history
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = days.map(day => ({ day, calories: 0 }));

    // Get last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);

      const dayMeals = mealHistory.filter(meal => {
        const mealDate = new Date(meal.originalDate);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === date.getTime();
      });

      const dayCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      weekData[i].calories = dayCalories;
    }

    return weekData;
  }, [mealHistory]);

  // Calculate average calories for the week
  const avgWeeklyCalories = useMemo(() => {
    const total = weeklyData.reduce((sum, day) => sum + day.calories, 0);
    return Math.round(total / 7);
  }, [weeklyData]);

  // Export Report - Generate PDF/HTML report for all meals
  const handleExportReport = () => {
    try {
      const totalMeals = filteredMeals.length;
      const totalCalories = filteredMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;
      const totalProtein = filteredMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
      const totalCarbs = filteredMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
      const totalFats = filteredMeals.reduce((sum, m) => sum + (m.fats || 0), 0);

      const reportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Meal History Report - ${reportDate}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #F97316;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #F97316;
              margin: 0;
              font-size: 32px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 30px 0;
            }
            .summary-item {
              background: #FFF7ED;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
            }
            .summary-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .summary-value {
              font-size: 28px;
              font-weight: bold;
              color: #F97316;
            }
            .meal-list {
              margin: 30px 0;
            }
            .meal-item {
              background: #F9FAFB;
              padding: 20px;
              margin: 15px 0;
              border-radius: 10px;
              border-left: 4px solid #F97316;
            }
            .meal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .meal-name {
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }
            .meal-date {
              color: #666;
              font-size: 14px;
            }
            .meal-macros {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-top: 15px;
            }
            .macro-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
            .macro-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .macro-value {
              font-size: 18px;
              font-weight: bold;
              color: #F97316;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <img src="${window.location.origin}/logo.png" alt="NutriVision.ai" style="width: 50px; height: 50px; object-fit: contain;" />
              <h1 style="margin: 0;">NutriVision.ai</h1>
            </div>
            <p>Meal History Report</p>
            <p style="color: #666; font-size: 14px;">Generated on ${reportDate}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Meals</div>
              <div class="summary-value">${totalMeals}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Calories</div>
              <div class="summary-value">${totalCalories.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Average Calories</div>
              <div class="summary-value">${avgCalories.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Protein</div>
              <div class="summary-value">${totalProtein.toFixed(1)}g</div>
            </div>
          </div>

          <div class="meal-list">
            <h2 style="color: #F97316; margin-bottom: 20px;">Meal Details</h2>
            ${filteredMeals.map(meal => `
              <div class="meal-item">
                <div class="meal-header">
                  <div>
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-date">${meal.date} • ${meal.time}</div>
                  </div>
                  <div style="font-size: 18px; font-weight: bold; color: #F97316;">
                    ${meal.calories} kcal
                  </div>
                </div>
                <div class="meal-macros">
                  <div class="macro-item">
                    <div class="macro-label">Protein</div>
                    <div class="macro-value">${meal.protein}g</div>
                  </div>
                  <div class="macro-item">
                    <div class="macro-label">Carbs</div>
                    <div class="macro-value">${meal.carbs}g</div>
                  </div>
                  <div class="macro-item">
                    <div class="macro-label">Fats</div>
                    <div class="macro-value">${meal.fats}g</div>
                  </div>
                  <div class="macro-item">
                    <div class="macro-label">Total</div>
                    <div class="macro-value">${(meal.protein + meal.carbs + meal.fats).toFixed(1)}g</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>Report generated by NutriVision.ai</p>
            <p>For personalized nutrition tracking and analysis</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NutriVision-Meal-Report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('Export report error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // View Report for individual meal
  const handleViewReport = (meal) => {
    try {
      const reportDate = new Date(meal.originalDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Meal Report - ${meal.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #F97316;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #F97316;
              margin: 0;
              font-size: 28px;
            }
            .meal-info {
              background: #FFF7ED;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .meal-name {
              font-size: 24px;
              font-weight: bold;
              color: #F97316;
              margin-bottom: 10px;
            }
            .meal-date {
              color: #666;
              font-size: 14px;
            }
            .nutrition-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .nutrition-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #F97316;
            }
            .nutrition-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .nutrition-value {
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }
            .macros {
              display: flex;
              justify-content: space-around;
              margin: 30px 0;
              padding: 20px;
              background: #F9FAFB;
              border-radius: 10px;
            }
            .macro-item {
              text-align: center;
            }
            .macro-value {
              font-size: 24px;
              font-weight: bold;
              color: #F97316;
            }
            .macro-label {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <img src="${window.location.origin}/logo.png" alt="NutriVision.ai" style="width: 50px; height: 50px; object-fit: contain;" />
              <h1 style="margin: 0;">NutriVision.ai</h1>
            </div>
            <p>Meal Analysis Report</p>
          </div>
          
          <div class="meal-info">
            <div class="meal-name">${meal.name}</div>
            <div class="meal-date">${reportDate} • ${meal.time}</div>
          </div>

          <div class="macros">
            <div class="macro-item">
              <div class="macro-value">${meal.calories}</div>
              <div class="macro-label">Calories</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${meal.protein}g</div>
              <div class="macro-label">Protein</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${meal.carbs}g</div>
              <div class="macro-label">Carbs</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${meal.fats}g</div>
              <div class="macro-label">Fats</div>
            </div>
          </div>

          <div class="nutrition-grid">
            <div class="nutrition-item">
              <div class="nutrition-label">Total Calories</div>
              <div class="nutrition-value">${meal.calories} kcal</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Protein</div>
              <div class="nutrition-value">${meal.protein}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Carbohydrates</div>
              <div class="nutrition-value">${meal.carbs}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Fats</div>
              <div class="nutrition-value">${meal.fats}g</div>
            </div>
          </div>

          <div class="footer">
            <p>Report generated by NutriVision.ai</p>
            <p>For personalized nutrition tracking and analysis</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window and trigger print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('View report error:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCaloriesMin('');
    setFilterCaloriesMax('');
    setSearchQuery('');
  };

  // Check if any filter is active
  const hasActiveFilters = filterDateFrom || filterDateTo || filterCaloriesMin || filterCaloriesMax || searchQuery.trim();

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
              Meal History & Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your nutrition journey over time
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {[filterDateFrom, filterDateTo, filterCaloriesMin, filterCaloriesMax, searchQuery].filter(Boolean).length}
                </span>
              )}
            </button>
            <button 
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="font-['Poppins']">Export Report</span>
            </button>
          </div>
        </motion.div>

        {/* Filter Panel */}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Poppins'] text-gray-900 dark:text-white">Filter Meals</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Calories
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filterCaloriesMin}
                  onChange={(e) => setFilterCaloriesMin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Calories
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={filterCaloriesMax}
                  onChange={(e) => setFilterCaloriesMax(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Poppins'] text-gray-900 dark:text-white">Weekly Calorie Trend</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Avg: {avgWeeklyCalories.toLocaleString()} kcal/day
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
              <XAxis 
                dataKey="day" 
                stroke={isDarkMode ? "#94a3b8" : "#9ca3af"}
                tick={{ fill: isDarkMode ? "#94a3b8" : "#9ca3af" }}
              />
              <YAxis 
                stroke={isDarkMode ? "#94a3b8" : "#9ca3af"}
                tick={{ fill: isDarkMode ? "#94a3b8" : "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  color: isDarkMode ? '#f1f5f9' : '#111827'
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#F7971E"
                strokeWidth={3}
                dot={{ fill: '#F7971E', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Meals', value: stats?.totalMeals?.toString() || mealHistory.length.toString(), icon: '🍽️' },
            { label: 'This Week', value: stats?.weeklyMeals?.toString() || weeklyData.filter(d => d.calories > 0).length.toString(), icon: '📅' },
            { label: 'Avg Calories', value: stats?.avgCalories?.toLocaleString() || avgWeeklyCalories.toLocaleString(), icon: '🔥' },
            { label: 'Streak', value: `${stats?.streak || 0} days`, icon: '⚡' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50 shadow-lg"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Meal History Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Poppins'] text-gray-900 dark:text-white">
              {searchQuery || hasActiveFilters ? 'Filtered Meals' : 'Recent Meals'}
            </h3>
            {(searchQuery || hasActiveFilters) && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredMeals.length} {filteredMeals.length === 1 ? 'meal' : 'meals'} found
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading meals...</p>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-12 backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/50 dark:border-slate-700/50">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No meals found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Start scanning meals to build your history!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full">
                      <span className="font-['Roboto_Mono']">{meal.calories} kcal</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-['Poppins'] text-gray-900 dark:text-white mb-1">
                          {meal.name}
                        </h4>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{meal.date} • {meal.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-blue-600 dark:text-blue-400">💪</p>
                        <p className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{meal.protein}g</p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                        <p className="text-yellow-600 dark:text-yellow-400">🌾</p>
                        <p className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{meal.carbs}g</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-purple-600 dark:text-purple-400">🥑</p>
                        <p className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{meal.fats}g</p>
                      </div>
                    </div>

                    {/* View Report Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(meal);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 font-['Poppins']"
                    >
                      View Report
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Load More */}
        {filteredMeals.length > 0 && !hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <button 
              onClick={loadMealHistory}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all font-['Poppins']"
            >
              Refresh Meals
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
