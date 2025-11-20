import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth.js';
import { getMealsForUser } from './meals.js';

const router = express.Router();

// Chatbot API endpoint - Google Gemini API
// Token optional hai - logged in users ko personalized advice milega
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Try to get userId from token (optional)
    let userId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.split(' ')[1] 
          : authHeader;
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
        }
      }
    } catch (tokenError) {
      // Token invalid or missing - continue without user context
      console.log('Chatbot: No valid token, providing general advice');
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const API_KEY = process.env.GOOGLE_API_KEY || process.env.CHATBOT_API_KEY || 'AIzaSyCRnBKkfb-QJCqKvv6Vtq0HCHE3VVf9cf0';
    
    console.log('Chatbot API Key:', API_KEY ? 'Found' : 'Not found');
    
    if (!API_KEY || API_KEY === 'your-chatbot-api-key') {
      // Fallback to mock if no API key
      const mockResponses = [
        "Great question! Based on your meal history, I'd recommend focusing on protein-rich foods.",
        "You're doing well with your nutrition goals! Keep tracking your meals.",
        "I can help you with nutrition advice. What specific question do you have?",
        "Your daily calorie intake looks balanced. Consider adding more vegetables for fiber."
      ];
      
      return res.json({
        success: true,
        data: {
          message: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          timestamp: new Date().toISOString()
        }
      });
    }

    // Comprehensive system instruction for NutriAI
    const systemInstruction = `You are NutriAI — an expert food analysis and nutrition assistant built for a Food Scanning Web App.
Your job is to analyze foods, images, user meals, and give perfect health guidance in simple language.

YOUR CORE RESPONSIBILITIES:

1. FOOD IDENTIFICATION:
   - When user uploads an image, identify the food accurately.
   - If unsure, give 2–3 possible guesses with confidence levels.
   - Be specific with food names (e.g., "chicken biryani", "roti", "dal", not just "food" or "dish").

2. CALORIE ESTIMATION:
   - Give estimated calories based on portion size.
   - Include a min–max calorie range (e.g., "approximately 450-550 calories").
   - Mention why you estimated that number (portion size, ingredients, cooking method).

3. NUTRITION BREAKDOWN:
   - Show approximate values for:
     • Carbs (grams)
     • Protein (grams)
     • Fats (grams)
     • Sugar (grams)
     • Fiber (grams)
     • Health score (0–100) - rate the overall healthiness

4. HEALTH ANALYSIS:
   - Tell if food is healthy, moderate, or unhealthy.
   - Explain in simple words why.
   - Use friendly, supportive tone.
   - Mention health benefits or concerns.

5. MEAL SUGGESTIONS:
   - Suggest a healthier alternative if meal is unhealthy.
   - Suggest portion control if meal is heavy.
   - Suggest drinks or sides that balance the meal.
   - Provide practical, actionable advice.

6. DIET RECOMMENDATIONS:
   - Provide diet tips based on user goals:
     • Weight loss (calorie deficit, portion control, healthy swaps)
     • Muscle gain (protein focus, calorie surplus, timing)
     • Balanced diet (variety, moderation, whole foods)
   - Give easy-to-follow advice.
   - Be encouraging and supportive.

7. NO MEDICAL ADVICE:
   - DO NOT give medical or disease-specific advice.
   - Stay strictly in the domain of nutrition & lifestyle.
   - If asked about medical conditions, redirect to consulting healthcare professionals.

8. CHAT BEHAVIOR:
   - Be friendly, conversational, respectful.
   - Keep responses short, clean and direct (150-300 words).
   - Always give VALUE in every answer.
   - Use simple language, avoid jargon.
   - Be encouraging and supportive.

9. IMAGE ANALYSIS FORMAT:
   - When image data is provided:
     • Start with: "Based on the image…"
     • Then: analysis → calories → health score → suggestions
   - Identify all visible food items.
   - Provide combined nutrition for the entire meal.

10. UNRELATED QUESTIONS:
   - If user asks anything unrelated to food/nutrition:
     • Politely redirect to nutrition or food questions.
     • Example: "I'm NutriAI, your food and nutrition expert! I can help you with food analysis, calories, nutrition, and meal planning. What would you like to know?"

IMPORTANT RULES:
- NEVER say "I am an AI model" or "I'm an AI".
- Always speak confidently as NutriAI — a food analysis expert.
- Be accurate, simple and professional.
- Use specific numbers when discussing calories and nutrients.
- Always mention portion sizes when discussing calories.
- Focus on balanced nutrition and moderation.
- Be encouraging and supportive of healthy eating goals.

RESPONSE STYLE:
- Friendly and conversational
- Direct and actionable
- Supportive and encouraging
- Simple language
- Specific numbers and data
- Practical tips

Remember: You are NutriAI, helping users make informed food choices and achieve their nutrition goals through accurate analysis and friendly guidance.`;
    
    // Get user's meal history and stats for context (if logged in)
    let userContext = '';
    if (userId) {
      const userMeals = await getMealsForUser(userId);
      const totalMeals = userMeals.length;
      const totalCalories = userMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;
      const recentMeals = userMeals.slice(0, 5).map(m => ({
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats
      }));
      
      if (totalMeals > 0) {
        userContext = `\n\nUSER'S MEAL HISTORY CONTEXT (for personalized advice):
- Total meals logged: ${totalMeals}
- Total calories consumed: ${totalCalories} kcal
- Average calories per meal: ${avgCalories} kcal
- Recent meals: ${recentMeals.map(m => `${m.name} (${m.calories} kcal)`).join(', ')}

Use this information to provide personalized nutrition advice. Reference their meal history when relevant.`;
      } else {
        userContext = '\n\nNote: This user is logged in but has no meal history yet. Encourage them to start tracking meals using the scan feature.';
      }
    } else {
      userContext = '\n\nNote: User is not logged in. Provide general nutrition advice. You can mention that logging in and tracking meals will provide personalized recommendations.';
    }
    
    // Enhanced system instruction with user context
    const enhancedSystemInstruction = systemInstruction + userContext;
    
    // Build contents array (alternating user/model messages)
    const contents = [];
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Google Gemini API call - Using gemini-1.5-flash (faster and free tier)
   const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    console.log('Calling Gemini API with key:', API_KEY.substring(0, 10) + '...');
    
    try {
      const requestBody = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: enhancedSystemInstruction }]
        },
        generationConfig: {
          temperature: 0.8, // Slightly higher for more creative but still accurate responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800, // Increased for detailed nutrition information
        }
      };

      const response = await axios.post(geminiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Gemini API Response status:', response.status);

      // Extract response text
      let botResponse = "I'm here to help with your nutrition questions!";
      
      if (response.data?.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content?.parts && candidate.content.parts.length > 0) {
          botResponse = candidate.content.parts[0].text || botResponse;
        }
      }

      res.json({
        success: true,
        data: {
          message: botResponse,
          timestamp: new Date().toISOString()
        }
      });
    } catch (apiError) {
      console.error('Gemini API Error Details:');
      console.error('Status:', apiError.response?.status);
      console.error('Data:', JSON.stringify(apiError.response?.data, null, 2));
      console.error('Message:', apiError.message);
      throw apiError;
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Check if it's an API key error
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your Google API key.',
        details: error.response?.data?.error?.message || error.message
      });
    }
    
    // Mock response if API fails
    const mockResponses = [
      "Great question! Based on your meal history, I'd recommend focusing on protein-rich foods.",
      "You're doing well with your nutrition goals! Keep tracking your meals.",
      "I can help you with nutrition advice. What specific question do you have?",
      "Your daily calorie intake looks balanced. Consider adding more vegetables for fiber.",
      "For better nutrition, try to include a variety of colorful vegetables in your meals.",
      "Remember to stay hydrated! Water is essential for good health."
    ];
    
    res.json({
      success: true,
      data: {
        message: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date().toISOString(),
        note: 'Using fallback response due to API error'
      }
    });
  }
});

// Get chatbot suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const suggestions = [
      {
        text: 'Log this meal',
        icon: 'Plus',
        action: 'log'
      },
      {
        text: 'Suggest alternative',
        icon: 'TrendingUp',
        action: 'suggest'
      },
      {
        text: 'Show macros',
        icon: 'Apple',
        action: 'macros'
      }
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

