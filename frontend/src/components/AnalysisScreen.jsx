import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Plus, Lightbulb, Share2, Download, ArrowRight, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mealsAPI } from '../utils/api';

export function AnalysisScreen({ imageUrl, analysisData, onNavigate, isDarkMode }) {
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Use API data if available, otherwise use defaults
  const detectedItems = useMemo(() => {
    if (analysisData?.detectedItems) {
      return analysisData.detectedItems;
    }
    return [
      { name: 'Grilled Chicken', confidence: 94, x: 20, y: 25, width: 35, height: 40 },
      { name: 'Quinoa', confidence: 88, x: 58, y: 30, width: 30, height: 35 },
      { name: 'Avocado', confidence: 92, x: 15, y: 68, width: 25, height: 20 },
    ];
  }, [analysisData]);

  const nutrients = useMemo(() => {
    if (analysisData?.nutrients) {
      const n = analysisData.nutrients;
      return [
        { nutrient: 'Calories', amount: `${n.calories || 520} kcal`, dailyPercent: Math.round((n.calories || 520) / 2000 * 100), color: '#F7971E', icon: '🔥' },
        { nutrient: 'Protein', amount: `${n.protein || 18}g`, dailyPercent: Math.round((n.protein || 18) / 75 * 100), color: '#3B82F6', icon: '💪' },
        { nutrient: 'Fat', amount: `${n.fats || 9}g`, dailyPercent: Math.round((n.fats || 9) / 75 * 100), color: '#8B5CF6', icon: '🥑' },
        { nutrient: 'Carbs', amount: `${n.carbs || 85}g`, dailyPercent: Math.round((n.carbs || 85) / 300 * 100), color: '#FFD200', icon: '🌾' },
        { nutrient: 'Fiber', amount: `${n.fiber || 12}g`, dailyPercent: Math.round((n.fiber || 12) / 25 * 100), color: '#62C370', icon: '🌿' },
        { nutrient: 'Sodium', amount: `${n.sodium || 340}mg`, dailyPercent: Math.round((n.sodium || 340) / 2300 * 100), color: '#EF4444', icon: '🧂' },
        { nutrient: 'Vitamin C', amount: `${n.vitaminC || 45}mg`, dailyPercent: Math.round((n.vitaminC || 45) / 90 * 100), color: '#F59E0B', icon: '🍊' },
        { nutrient: 'Iron', amount: `${n.iron || 3.2}mg`, dailyPercent: Math.round((n.iron || 3.2) / 18 * 100), color: '#6B7280', icon: '⚡' },
      ];
    }
    return [
      { nutrient: 'Calories', amount: '520 kcal', dailyPercent: 26, color: '#F7971E', icon: '🔥' },
      { nutrient: 'Protein', amount: '18g', dailyPercent: 24, color: '#3B82F6', icon: '💪' },
      { nutrient: 'Fat', amount: '9g', dailyPercent: 12, color: '#8B5CF6', icon: '🥑' },
      { nutrient: 'Carbs', amount: '85g', dailyPercent: 28, color: '#FFD200', icon: '🌾' },
      { nutrient: 'Fiber', amount: '12g', dailyPercent: 48, color: '#62C370', icon: '🌿' },
      { nutrient: 'Sodium', amount: '340mg', dailyPercent: 15, color: '#EF4444', icon: '🧂' },
      { nutrient: 'Vitamin C', amount: '45mg', dailyPercent: 50, color: '#F59E0B', icon: '🍊' },
      { nutrient: 'Iron', amount: '3.2mg', dailyPercent: 18, color: '#6B7280', icon: '⚡' },
    ];
  }, [analysisData]);

  const macroData = useMemo(() => {
    if (analysisData?.nutrients) {
      const n = analysisData.nutrients;
      return [
        { name: 'Protein', value: n.protein || 18, color: '#3B82F6' },
        { name: 'Carbs', value: n.carbs || 85, color: '#FFD200' },
        { name: 'Fats', value: n.fats || 9, color: '#8B5CF6' },
      ];
    }
    return [
      { name: 'Protein', value: 18, color: '#3B82F6' },
      { name: 'Carbs', value: 85, color: '#FFD200' },
      { name: 'Fats', value: 9, color: '#8B5CF6' },
    ];
  }, [analysisData]);

  const handleAddToMeals = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first to save meals. Redirecting to login...');
      onNavigate('login');
      return;
    }

    setIsSaving(true);
    try {
      // Get meal name from detected items or use a default
      const mealName = detectedItems.length > 0 
        ? detectedItems.map(item => item.name).join(', ') 
        : 'Scanned Meal';
      
      // Extract nutrition data
      const nutrients = analysisData?.nutrients || {};
      const calories = nutrients.calories || analysisData?.calories || 0;
      const protein = nutrients.protein || 0;
      const carbs = nutrients.carbs || 0;
      const fats = nutrients.fats || 0;
      
      console.log('🔄 Saving meal:', {
        name: mealName,
        calories,
        protein,
        carbs,
        fats,
        hasImage: !!imageUrl,
        hasAnalysisData: !!analysisData
      });

      // Validate that we have at least some data
      if (!analysisData && !imageUrl) {
        throw new Error('No analysis data available. Please scan the image again.');
      }

      const mealData = {
        name: mealName,
        image: imageUrl || '',
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        nutrients: nutrients || {}
      };

      console.log('📤 Meal data to send:', mealData);

      const response = await mealsAPI.addMeal(mealData);
      
      console.log('✅ Meal save response:', response);
      
      if (response && response.success) {
        console.log('🎉 Meal saved successfully!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        throw new Error(response?.error || response?.message || 'Failed to save meal');
      }
    } catch (error) {
      console.error('❌ Failed to save meal:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to save meal. ';
      
      if (error.message.includes('logged in') || error.message.includes('token') || error.message.includes('login')) {
        errorMessage = 'Please login first to save meals.';
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else if (error.message.includes('Backend server') || error.message.includes('not running')) {
        errorMessage = 'Backend server is not running. Please start the server on port 5001.';
      } else if (error.message.includes('No analysis data')) {
        errorMessage = error.message;
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate and download PDF report
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a printable HTML content
      const mealName = detectedItems.length > 0 
        ? detectedItems.map(item => item.name).join(', ') 
        : 'Scanned Meal';
      
      const nutrients = analysisData?.nutrients || {};
      const calories = nutrients.calories || analysisData?.calories || 0;
      const protein = nutrients.protein || 0;
      const carbs = nutrients.carbs || 0;
      const fats = nutrients.fats || 0;
      const fiber = nutrients.fiber || 0;
      const sodium = nutrients.sodium || 0;
      const vitaminC = nutrients.vitaminC || 0;
      const iron = nutrients.iron || 0;
      const confidence = analysisData?.confidence || 85;

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Nutrition Report - ${mealName}</title>
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
            .confidence {
              display: inline-block;
              background: #10B981;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
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
            .detected-items {
              margin: 20px 0;
            }
            .detected-item {
              padding: 10px;
              background: #F9FAFB;
              margin: 5px 0;
              border-radius: 5px;
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
              .nutrition-grid { grid-template-columns: repeat(2, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <img src="${window.location.origin}/logo.png" alt="NutriVision.ai" style="width: 50px; height: 50px; object-fit: contain;" />
              <h1 style="margin: 0;">NutriVision.ai</h1>
            </div>
            <p>Nutrition Analysis Report</p>
          </div>
          
          <div class="meal-info">
            <div class="meal-name">${mealName}</div>
            <span class="confidence">${confidence}% Accuracy</span>
          </div>

          <div class="macros">
            <div class="macro-item">
              <div class="macro-value">${calories}</div>
              <div class="macro-label">Calories</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${protein}g</div>
              <div class="macro-label">Protein</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${carbs}g</div>
              <div class="macro-label">Carbs</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${fats}g</div>
              <div class="macro-label">Fats</div>
            </div>
          </div>

          <h2 style="color: #F97316; margin-top: 30px;">Complete Nutrition Breakdown</h2>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <div class="nutrition-label">Calories</div>
              <div class="nutrition-value">${calories} kcal</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Protein</div>
              <div class="nutrition-value">${protein}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Carbohydrates</div>
              <div class="nutrition-value">${carbs}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Fats</div>
              <div class="nutrition-value">${fats}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Fiber</div>
              <div class="nutrition-value">${fiber}g</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Sodium</div>
              <div class="nutrition-value">${sodium}mg</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Vitamin C</div>
              <div class="nutrition-value">${vitaminC}mg</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-label">Iron</div>
              <div class="nutrition-value">${iron}mg</div>
            </div>
          </div>

          ${detectedItems.length > 0 ? `
          <div class="detected-items">
            <h2 style="color: #F97316;">Detected Food Items</h2>
            ${detectedItems.map(item => `
              <div class="detected-item">
                <strong>${item.name}</strong> - ${item.confidence}% confidence
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by NutriVision.ai</p>
            <p>Report Date: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print();
          // After printing, close the window
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-report-${mealName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share report
  const handleShare = async () => {
    try {
      const mealName = detectedItems.length > 0 
        ? detectedItems.map(item => item.name).join(', ') 
        : 'Scanned Meal';
      
      const nutrients = analysisData?.nutrients || {};
      const calories = nutrients.calories || analysisData?.calories || 0;
      const protein = nutrients.protein || 0;
      const carbs = nutrients.carbs || 0;
      const fats = nutrients.fats || 0;

      const shareText = `🍎 Nutrition Analysis Report\n\n` +
        `Meal: ${mealName}\n` +
        `Calories: ${calories} kcal\n` +
        `Protein: ${protein}g | Carbs: ${carbs}g | Fats: ${fats}g\n\n` +
        `Analyzed by NutriVision.ai`;

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `Nutrition Report - ${mealName}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Report details copied to clipboard! 📋');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        // Fallback: Copy to clipboard
        try {
          const mealName = detectedItems.length > 0 
            ? detectedItems.map(item => item.name).join(', ') 
            : 'Scanned Meal';
          const nutrients = analysisData?.nutrients || {};
          const calories = nutrients.calories || analysisData?.calories || 0;
          const shareText = `Nutrition Report: ${mealName} - ${calories} kcal`;
          await navigator.clipboard.writeText(shareText);
          alert('Report details copied to clipboard! 📋');
        } catch (clipboardError) {
          alert('Sharing not available. Please use the download option.');
        }
      }
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-lg bg-green-500/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-['Poppins']">Added to your meals! ✨</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="backdrop-blur-lg bg-gradient-to-r from-green-500/90 to-emerald-500/90 rounded-2xl p-6 text-white shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="font-['Poppins'] mb-1">Analysis Complete! ✨</h2>
              <p className="opacity-90">Your meal has been successfully analyzed</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                title="Share Report"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Image with Bounding Boxes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl">
              <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-4">Detected Food Items</h3>
              <div className="relative rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={imageUrl}
                  alt="Analyzed meal"
                  className="w-full h-80 object-cover"
                />
                
                {/* Bounding Boxes */}
                {detectedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    style={{
                      position: 'absolute',
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.width}%`,
                      height: `${item.height}%`,
                    }}
                    className="border-3 border-orange-500 rounded-lg"
                  >
                    <div className="absolute -top-8 left-0 bg-orange-500 text-white px-3 py-1 rounded-lg font-['Poppins'] shadow-lg whitespace-nowrap">
                      {item.name} {item.confidence}%
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Detected Items List */}
              <div className="mt-4 space-y-2">
                {detectedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <span className="text-gray-900 dark:text-white">{item.name}</span>
                    <span className="font-['Roboto_Mono'] text-green-500">{item.confidence}% match</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Dish Info & Macros */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Dish Name Card */}
            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                    {detectedItems.length > 0 
                      ? detectedItems.map(item => item.name).join(', ') 
                      : 'Scanned Meal'}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">
                    <span className="font-['Roboto_Mono']">
                      {analysisData?.confidence || 85}% Accuracy
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                  High Protein
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                  Healthy Fats
                </span>
              </div>
            </div>

            {/* Macro Pie Chart */}
            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl">
              <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-4">Macro Breakdown</h3>
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {macroData.map((macro, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{macro.name}</span>
                      <span className="font-['Roboto_Mono'] text-gray-900 dark:text-white">{macro.value}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Nutrition Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl mb-6"
        >
          <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-6">Complete Nutrition Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Nutrient</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Daily %</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Progress</th>
                </tr>
              </thead>
              <tbody>
                {nutrients.map((nutrient, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{nutrient.icon}</span>
                        <span className="text-gray-900 dark:text-white">{nutrient.nutrient}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-['Roboto_Mono'] text-gray-900 dark:text-white">
                      {nutrient.amount}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-3 py-1 rounded-full font-['Roboto_Mono']"
                        style={{
                          backgroundColor: `${nutrient.color}20`,
                          color: nutrient.color,
                        }}
                      >
                        {nutrient.dailyPercent}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nutrient.dailyPercent}%` }}
                          transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: nutrient.color }}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔘 Add to Meals button clicked');
              handleAddToMeals();
            }}
            disabled={isSaving}
            type="button"
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Plus className="w-5 h-5" />
            <span className="font-['Poppins']">
              {isSaving ? 'Saving...' : 'Add to My Meals'}
            </span>
          </button>
          <button
            onClick={() => onNavigate('recommendations')}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-['Poppins']">Get Diet Suggestion</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-5 h-5" />
            <span className="font-['Poppins']">
              {isGeneratingPDF ? 'Generating...' : 'Generate PDF Report'}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

