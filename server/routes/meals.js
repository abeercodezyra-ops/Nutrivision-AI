import express from 'express';
import { verifyToken } from './auth.js';
import Meal from '../models/Meal.js';
import mongoose from 'mongoose';

const router = express.Router();

// In-memory fallback storage (if MongoDB not connected)
let inMemoryMeals = [];

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get user's meal history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    if (isMongoConnected()) {
      // Use MongoDB
      const userMeals = await Meal.find({ userId })
        .sort({ date: -1 })
        .lean();

      return res.json({
        success: true,
        data: userMeals.map(meal => ({
          ...meal,
          id: meal._id.toString(),
          date: meal.date.toISOString(),
          createdAt: meal.createdAt.toISOString()
        }))
      });
    } else {
      // Use in-memory storage
      const userMeals = inMemoryMeals
        .filter(m => m.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.json({
        success: true,
        data: userMeals
      });
    }
  } catch (error) {
    console.error('Get meal history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meal history',
      message: error.message
    });
  }
});

// Add meal
router.post('/add', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { name, image, calories, protein, carbs, fats, nutrients } = req.body;

    console.log('Received meal data:', {
      userId,
      name,
      hasImage: !!image,
      calories,
      protein,
      carbs,
      fats
    });

    // Validate required fields - at least name or image should be present
    if (!name && !image) {
      console.error('Validation failed: No name or image provided');
      return res.status(400).json({
        success: false,
        error: 'Meal name or image is required'
      });
    }

    let meal;
    let totalMeals;

    if (isMongoConnected()) {
      // Use MongoDB
      meal = await Meal.create({
        userId,
        name: name || 'Scanned Meal',
        image: image || '',
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        nutrients: nutrients || {},
        date: new Date()
      });

      totalMeals = await Meal.countDocuments({ userId });

      console.log('✅ Meal saved successfully (MongoDB):', { 
        userId, 
        mealId: meal._id.toString(), 
        name: meal.name,
        calories: meal.calories, 
        totalMeals
      });

      return res.json({
        success: true,
        data: {
          ...meal.toObject(),
          id: meal._id.toString(),
          date: meal.date.toISOString(),
          createdAt: meal.createdAt.toISOString()
        },
        message: 'Meal saved successfully'
      });
    } else {
      // Use in-memory storage
      meal = {
        id: Date.now().toString(),
        userId,
        name: name || 'Scanned Meal',
        image: image || '',
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        nutrients: nutrients || {},
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      inMemoryMeals.push(meal);
      totalMeals = inMemoryMeals.filter(m => m.userId === userId).length;

      console.log('✅ Meal saved successfully (In-Memory):', { 
        userId, 
        mealId: meal.id, 
        name: meal.name,
        calories: meal.calories, 
        totalMeals
      });

      return res.json({
        success: true,
        data: meal,
        message: 'Meal saved successfully'
      });
    }
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add meal',
      message: error.message
    });
  }
});

// Get meal statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    let userMeals;

    if (isMongoConnected()) {
      // Use MongoDB
      userMeals = await Meal.find({ userId }).lean();
    } else {
      // Use in-memory storage
      userMeals = inMemoryMeals.filter(m => m.userId === userId);
    }

    const totalMeals = userMeals.length;
    const totalCalories = userMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;

    // Calculate weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyMeals = userMeals.filter(m => {
      const mealDate = new Date(m.date);
      return mealDate >= oneWeekAgo;
    });

    res.json({
      success: true,
      data: {
        totalMeals,
        totalCalories,
        avgCalories,
        weeklyMeals: weeklyMeals.length,
        streak: calculateStreak(userMeals)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Helper function to calculate streak
function calculateStreak(meals) {
  if (meals.length === 0) return 0;

  const sortedMeals = meals.sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const meal of sortedMeals) {
    const mealDate = new Date(meal.date);
    mealDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - mealDate) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}

// Export function to get meals for chatbot (used in chatbot route)
export const getMealsForUser = async (userId) => {
  try {
    if (isMongoConnected()) {
      return await Meal.find({ userId }).lean();
    } else {
      return inMemoryMeals.filter(m => m.userId === userId);
    }
  } catch (error) {
    console.error('Get meals for chatbot error:', error);
    return [];
  }
};

export default router;
