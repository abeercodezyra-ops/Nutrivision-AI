import express from 'express';
import multer from 'multer';
import axios from 'axios';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Food Nutrition Database (per 100g) - Common foods
const foodNutritionDB = {
  // Proteins
  'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sodium: 74, vitaminC: 0, iron: 0.9 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sodium: 74, vitaminC: 0, iron: 0.9 },
  'grilled chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sodium: 74, vitaminC: 0, iron: 0.9 },
  'fish': { calories: 206, protein: 22, carbs: 0, fats: 12, fiber: 0, sodium: 61, vitaminC: 0, iron: 0.8 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, sodium: 44, vitaminC: 0, iron: 0.8 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, sodium: 124, vitaminC: 0, iron: 1.2 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, sodium: 124, vitaminC: 0, iron: 1.2 },
  'paneer': { calories: 265, protein: 18, carbs: 1.2, fats: 20, fiber: 0, sodium: 15, vitaminC: 0, iron: 0.2 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fats: 4.8, fiber: 0.3, sodium: 7, vitaminC: 0, iron: 1.1 },
  
  // Carbs/Grains
  'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, sodium: 1, vitaminC: 0, iron: 0.8 },
  'biryani': { calories: 250, protein: 8, carbs: 35, fats: 8, fiber: 1, sodium: 500, vitaminC: 2, iron: 1.5 },
  'roti': { calories: 297, protein: 9, carbs: 46, fats: 9, fiber: 2.7, sodium: 536, vitaminC: 0, iron: 2.9 },
  'chapati': { calories: 297, protein: 9, carbs: 46, fats: 9, fiber: 2.7, sodium: 536, vitaminC: 0, iron: 2.9 },
  'naan': { calories: 310, protein: 8, carbs: 50, fats: 8, fiber: 2, sodium: 600, vitaminC: 0, iron: 2 },
  'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7, sodium: 491, vitaminC: 0, iron: 3.6 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, sodium: 1, vitaminC: 0, iron: 1.3 },
  'noodles': { calories: 138, protein: 4.5, carbs: 25, fats: 2.1, fiber: 1.2, sodium: 5, vitaminC: 0, iron: 0.6 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22, fats: 1.9, fiber: 2.8, sodium: 7, vitaminC: 0, iron: 1.5 },
  
  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, sodium: 33, vitaminC: 89, iron: 0.7 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, sodium: 69, vitaminC: 6, iron: 0.3 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, sodium: 5, vitaminC: 14, iron: 0.3 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7, sodium: 4, vitaminC: 7, iron: 0.2 },
  'potato': { calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2, sodium: 6, vitaminC: 20, iron: 0.8 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, sodium: 79, vitaminC: 28, iron: 2.7 },
  'cabbage': { calories: 25, protein: 1.3, carbs: 6, fats: 0.1, fiber: 2.5, sodium: 18, vitaminC: 37, iron: 0.5 },
  'cauliflower': { calories: 25, protein: 1.9, carbs: 5, fats: 0.3, fiber: 2, sodium: 30, vitaminC: 48, iron: 0.4 },
  'pepper': { calories: 31, protein: 1, carbs: 7, fats: 0.3, fiber: 2.5, sodium: 4, vitaminC: 142, iron: 0.4 },
  'bell pepper': { calories: 31, protein: 1, carbs: 7, fats: 0.3, fiber: 2.5, sodium: 4, vitaminC: 142, iron: 0.4 },
  
  // Fruits
  'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, sodium: 1, vitaminC: 4.6, iron: 0.1 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, sodium: 1, vitaminC: 8.7, iron: 0.3 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, sodium: 0, vitaminC: 53, iron: 0.1 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fats: 0.4, fiber: 1.6, sodium: 1, vitaminC: 36, iron: 0.2 },
  'avocado': { calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, sodium: 7, vitaminC: 10, iron: 0.6 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2, sodium: 1, vitaminC: 59, iron: 0.4 },
  
  // Dairy
  'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, fiber: 0, sodium: 44, vitaminC: 0, iron: 0 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0, sodium: 36, vitaminC: 0, iron: 0 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fats: 33, fiber: 0, sodium: 621, vitaminC: 0, iron: 0.7 },
  
  // Nuts & Seeds
  'almond': { calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, sodium: 1, vitaminC: 0, iron: 3.7 },
  'peanut': { calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 8.5, sodium: 18, vitaminC: 0, iron: 4.6 },
  'walnut': { calories: 654, protein: 15, carbs: 14, fats: 65, fiber: 6.7, sodium: 2, vitaminC: 0, iron: 2.9 },
  
  // Legumes
  'dal': { calories: 116, protein: 7.8, carbs: 20, fats: 0.4, fiber: 7.9, sodium: 2, vitaminC: 1, iron: 2.5 },
  'lentil': { calories: 116, protein: 7.8, carbs: 20, fats: 0.4, fiber: 7.9, sodium: 2, vitaminC: 1, iron: 2.5 },
  'chickpea': { calories: 164, protein: 8.9, carbs: 27, fats: 2.6, fiber: 7.6, sodium: 7, vitaminC: 1.3, iron: 2.9 },
  'rajma': { calories: 127, protein: 8.7, carbs: 23, fats: 0.5, fiber: 6.4, sodium: 2, vitaminC: 0.8, iron: 2.1 },
  
  // Oils & Fats
  'oil': { calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, sodium: 0, vitaminC: 0, iron: 0 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81, fiber: 0, sodium: 11, vitaminC: 0, iron: 0 },
  'ghee': { calories: 900, protein: 0, carbs: 0, fats: 100, fiber: 0, sodium: 0, vitaminC: 0, iron: 0 },
};

// Helper function to find food in database
function findFoodInDB(foodName) {
  const normalized = foodName.toLowerCase().trim();
  
  // Remove common suffixes/prefixes for better matching
  const cleaned = normalized
    .replace(/\s*(cooked|fried|grilled|baked|boiled|steamed|raw|fresh|dried)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Direct match
  if (foodNutritionDB[cleaned]) {
    return foodNutritionDB[cleaned];
  }
  
  // Try original normalized name
  if (foodNutritionDB[normalized]) {
    return foodNutritionDB[normalized];
  }
  
  // Partial match - check if any key is contained in the food name or vice versa
  for (const [key, value] of Object.entries(foodNutritionDB)) {
    // Check if key is in food name (e.g., "chicken" in "chicken biryani")
    if (cleaned.includes(key) || normalized.includes(key)) {
      return value;
    }
    // Check if food name is in key (e.g., "biryani" might match "chicken biryani" in DB)
    if (key.includes(cleaned) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

// Helper function to calculate nutrition for detected foods
function calculateNutrition(foodItems) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalVitaminC = 0;
  let totalIron = 0;
  
  const identifiedFoods = [];
  
  // Process each detected food item
  for (const item of foodItems) {
    const foodName = item.name.toLowerCase().trim();
    
    // Skip if it's a generic term
    if (foodName === 'food item' || foodName === 'food' || foodName === 'dish' || foodName === 'meal') {
      continue;
    }
    
    const nutrition = findFoodInDB(foodName);
    
    if (nutrition) {
      // Estimate portion size based on confidence and typical serving
      // Higher confidence = more accurate portion estimation
      // Typical serving sizes: main dishes ~200-300g, sides ~100-150g, snacks ~50-100g
      let basePortion = 150; // Default 150g
      
      // Adjust based on food type (complex dishes like biryani are larger)
      if (foodName.includes('biryani') || foodName.includes('curry') || foodName.includes('pulao')) {
        basePortion = 250; // Larger portion for main dishes
      } else if (foodName.includes('roti') || foodName.includes('naan') || foodName.includes('chapati')) {
        basePortion = 50; // Single roti is ~50g
      } else if (foodName.includes('dal') || foodName.includes('sabzi')) {
        basePortion = 150; // Medium portion for sides
      } else if (foodName.includes('fruit') || foodName.includes('apple') || foodName.includes('banana')) {
        basePortion = 100; // Standard fruit size
      }
      
      // Adjust based on confidence (higher confidence = more accurate)
      const confidenceMultiplier = 0.7 + (item.confidence / 100) * 0.3; // 0.7 to 1.0
      const portionMultiplier = (basePortion / 100) * confidenceMultiplier;
      
      const calories = Math.round(nutrition.calories * portionMultiplier);
      const protein = Math.round(nutrition.protein * portionMultiplier * 10) / 10;
      const carbs = Math.round(nutrition.carbs * portionMultiplier * 10) / 10;
      const fats = Math.round(nutrition.fats * portionMultiplier * 10) / 10;
      const fiber = Math.round(nutrition.fiber * portionMultiplier * 10) / 10;
      const sodium = Math.round(nutrition.sodium * portionMultiplier);
      const vitaminC = Math.round(nutrition.vitaminC * portionMultiplier * 10) / 10;
      const iron = Math.round(nutrition.iron * portionMultiplier * 10) / 10;
      
      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFats += fats;
      totalFiber += fiber;
      totalSodium += sodium;
      totalVitaminC += vitaminC;
      totalIron += iron;
      
      identifiedFoods.push({
        name: item.name, // Keep original name
        nutrition: {
          calories,
          protein,
          carbs,
          fats,
          fiber,
          sodium,
          vitaminC,
          iron
        }
      });
    } else {
      // If food not found in DB, estimate based on food type
      console.log('Food not found in DB:', foodName);
      
      // Estimate based on common patterns
      let estimatedCalories = 200;
      let estimatedProtein = 10;
      let estimatedCarbs = 30;
      let estimatedFats = 5;
      
      if (foodName.includes('chicken') || foodName.includes('meat') || foodName.includes('fish')) {
        estimatedCalories = 250;
        estimatedProtein = 25;
        estimatedCarbs = 5;
        estimatedFats = 12;
      } else if (foodName.includes('rice') || foodName.includes('biryani') || foodName.includes('pulao')) {
        estimatedCalories = 300;
        estimatedProtein = 6;
        estimatedCarbs = 60;
        estimatedFats = 5;
      } else if (foodName.includes('roti') || foodName.includes('naan') || foodName.includes('bread')) {
        estimatedCalories = 150;
        estimatedProtein = 5;
        estimatedCarbs = 25;
        estimatedFats = 4;
      } else if (foodName.includes('dal') || foodName.includes('lentil')) {
        estimatedCalories = 120;
        estimatedProtein = 8;
        estimatedCarbs = 20;
        estimatedFats = 0.5;
      } else if (foodName.includes('fruit') || foodName.includes('apple') || foodName.includes('banana')) {
        estimatedCalories = 80;
        estimatedProtein = 0.5;
        estimatedCarbs = 20;
        estimatedFats = 0.3;
      }
      
      const confidenceMultiplier = 0.7 + (item.confidence / 100) * 0.3;
      
      totalCalories += Math.round(estimatedCalories * confidenceMultiplier);
      totalProtein += Math.round(estimatedProtein * confidenceMultiplier * 10) / 10;
      totalCarbs += Math.round(estimatedCarbs * confidenceMultiplier * 10) / 10;
      totalFats += Math.round(estimatedFats * confidenceMultiplier * 10) / 10;
      totalFiber += Math.round(2 * confidenceMultiplier * 10) / 10;
      totalSodium += Math.round(200 * confidenceMultiplier);
      totalVitaminC += Math.round(15 * confidenceMultiplier * 10) / 10;
      totalIron += Math.round(1.5 * confidenceMultiplier * 10) / 10;
      
      identifiedFoods.push({
        name: item.name,
        nutrition: {
          calories: Math.round(estimatedCalories * confidenceMultiplier),
          protein: Math.round(estimatedProtein * confidenceMultiplier * 10) / 10,
          carbs: Math.round(estimatedCarbs * confidenceMultiplier * 10) / 10,
          fats: Math.round(estimatedFats * confidenceMultiplier * 10) / 10
        }
      });
    }
  }
  
  // If no foods found at all, use conservative estimates
  if (totalCalories === 0 && foodItems.length > 0) {
    const avgCalories = 300;
    totalCalories = avgCalories;
    totalProtein = Math.round(avgCalories * 0.12);
    totalCarbs = Math.round(avgCalories * 0.55);
    totalFats = Math.round(avgCalories * 0.10);
    totalFiber = Math.round(avgCalories * 0.03);
    totalSodium = 250;
    totalVitaminC = 20;
    totalIron = 2.0;
  }
  
  return {
    calories: Math.max(0, totalCalories),
    protein: Math.max(0, Math.round(totalProtein * 10) / 10),
    carbs: Math.max(0, Math.round(totalCarbs * 10) / 10),
    fats: Math.max(0, Math.round(totalFats * 10) / 10),
    fiber: Math.max(0, Math.round(totalFiber * 10) / 10),
    sodium: Math.max(0, totalSodium),
    vitaminC: Math.max(0, Math.round(totalVitaminC * 10) / 10),
    iron: Math.max(0, Math.round(totalIron * 10) / 10),
    identifiedFoods
  };
}

// Food Analysis API endpoint - Google Vision API
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const API_KEY = process.env.GOOGLE_API_KEY || process.env.FOOD_ANALYSIS_API_KEY;
    
    if (!API_KEY) {
      // Fallback to mock if no API key
      return res.json({
        success: true,
        data: {
          detectedItems: [
            { name: 'Food Item', confidence: 85, x: 20, y: 25, width: 35, height: 40 }
          ],
          nutrients: {
            calories: 520,
            protein: 18,
            carbs: 85,
            fats: 9,
            fiber: 12,
            sodium: 340,
            vitaminC: 45,
            iron: 3.2
          },
          calories: 520,
          confidence: 85,
          recommendations: ['High protein meal', 'Healthy fats present']
        }
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    
    console.log('🔍 Analyzing food image...');
    console.log('📸 Image size:', req.file.size, 'bytes');
    console.log('📸 Image type:', req.file.mimetype);
    console.log('🔑 API Key present:', !!API_KEY);

    // Step 1: Use Google Vision API for initial detection (optional, skip if fails)
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
    
    let visionLabels = [];
    let visionObjects = [];
    
    try {
      const visionResponse = await axios.post(visionUrl, {
        requests: [{
          image: {
            content: imageBase64
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 15 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
            { type: 'TEXT_DETECTION', maxResults: 5 }
          ]
        }]
      }, {
        timeout: 30000
      });

      visionLabels = visionResponse.data.responses[0]?.labelAnnotations || [];
      visionObjects = visionResponse.data.responses[0]?.localizedObjectAnnotations || [];
      
      console.log('✅ Vision API detected:', visionLabels.length, 'labels,', visionObjects.length, 'objects');
    } catch (visionError) {
      console.warn('⚠️ Vision API error (continuing with Gemini):', visionError.response?.status || visionError.message);
      // Continue with Gemini API - Vision is optional
    }

    // Step 2: Use Gemini API for better food identification
    let geminiFoodList = [];
    
    try {
      // Try multiple Gemini endpoint formats
      const geminiEndpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${API_KEY}`
      ];
      
      // Build prompt for Gemini
      const visionLabelsText = visionLabels.slice(0, 10).map(l => l.description).join(', ');
      const visionObjectsText = visionObjects.slice(0, 10).map(o => o.name).join(', ');
      
      const geminiPrompt = `You are a food recognition expert. Analyze THIS EXACT IMAGE and identify ONLY food items that are ACTUALLY VISIBLE in the image.

CRITICAL RULES - READ CAREFULLY:
1. Look at the ACTUAL IMAGE - identify ONLY what you can SEE in the image
2. ONLY identify FOOD ITEMS that are CLEARLY VISIBLE (edible items like fruits, vegetables, cooked dishes, grains, proteins, etc.)
3. REJECT non-food items (ovens, stoves, kitchen equipment, utensils, plates, containers, hands, people, animals, furniture, etc.)
4. REJECT items that are NOT in the image - do NOT guess or make up food items
5. Be VERY SPECIFIC with food names (e.g., "pizza", "chicken biryani", "roti", "dal", "apple", "banana", NOT generic terms)
6. If you see a pizza oven but NO actual pizza visible, do NOT return "pizza" - only return what food is actually visible
7. If no food items are clearly visible in the image, return an empty array: []
8. DO NOT return food items based on context clues (like "there's an oven so there must be pizza") - only return what you ACTUALLY SEE

Previous detections (may be wrong, verify with actual image): ${visionLabelsText || 'None'}, Objects: ${visionObjectsText || 'None'}

IMPORTANT: Ignore previous detections if they don't match what you see in the image. Trust your own analysis of the image.

Return ONLY a JSON array in this exact format (no other text, no explanations):
[
  {"name": "specific food name", "confidence": 85},
  {"name": "another specific food", "confidence": 90}
]

Examples of good names: "pizza", "chicken biryani", "roti", "dal", "apple", "banana", "rice", "curry", "salad", "burger"
Examples of BAD names (DO NOT USE): "food", "dish", "item", "meal", "object", "thing", "oven", "stove", "kitchen"

Return ONLY the JSON array, no other text. If no food is visible, return: []`;

      let geminiResponse = null;
      let lastError = null;
      
      // Try each endpoint
      for (const geminiUrl of geminiEndpoints) {
        try {
          console.log('Trying Gemini endpoint:', geminiUrl.split('?')[0]);
          geminiResponse = await axios.post(geminiUrl, {
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: req.file.mimetype || 'image/jpeg',
                    data: imageBase64
                  }
                },
                { text: geminiPrompt }
              ]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            }
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });
          
          // If successful, break out of loop
          if (geminiResponse && geminiResponse.data) {
            console.log('✅ Gemini API success');
            break;
          }
        } catch (endpointError) {
          lastError = endpointError;
          console.warn(`⚠️ Gemini endpoint failed: ${endpointError.response?.status || endpointError.message}`);
          continue; // Try next endpoint
        }
      }
      
      if (!geminiResponse || !geminiResponse.data) {
        throw lastError || new Error('All Gemini endpoints failed');
      }

      const geminiText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('🔍 Gemini raw response:', geminiText.substring(0, 500));
      
      // Extract JSON from response
      const jsonMatch = geminiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          geminiFoodList = JSON.parse(jsonMatch[0]);
          console.log('📋 Parsed Gemini food list:', JSON.stringify(geminiFoodList, null, 2));
          
          // Filter out non-food items and validate
          geminiFoodList = geminiFoodList.filter(item => {
            if (!item || !item.name) {
              console.log('❌ Rejected: Invalid item structure');
              return false;
            }
            const name = item.name.toLowerCase().trim();
            
            // Reject generic or non-food terms
            const rejectTerms = ['food', 'dish', 'item', 'meal', 'object', 'thing', 'container', 'plate', 'bowl', 'utensil', 'phone', 'book', 'hand', 'person', 'animal', 'oven', 'stove', 'kitchen', 'equipment', 'furniture', 'appliance'];
            if (rejectTerms.some(term => name === term || name.includes(term))) {
              console.log('❌ Rejected non-food item:', name);
              return false;
            }
            
            // Ensure confidence is valid
            item.confidence = Math.min(100, Math.max(0, item.confidence || 85));
            console.log('✅ Accepted food item:', name, 'confidence:', item.confidence);
            return true;
          });
          
          console.log('✅ Final filtered food items:', geminiFoodList.length, geminiFoodList.map(f => f.name).join(', '));
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          console.error('Raw response:', geminiText.substring(0, 500));
        }
      } else {
        console.warn('⚠️ No JSON array found in Gemini response');
        console.warn('Full response:', geminiText);
      }
    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError.response?.status || geminiError.message);
      console.error('Error details:', geminiError.response?.data || 'No response data');
      // Continue - we'll use fallback detection
    }

    // Step 3: Combine results from Vision and Gemini
    const allDetectedFoods = [];
    
    // Filter Vision labels for food-related terms only
    const foodRelatedTerms = ['food', 'dish', 'meal', 'cuisine', 'recipe', 'cooking', 'restaurant', 'breakfast', 'lunch', 'dinner', 'snack', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'rice', 'bread', 'pasta', 'pizza', 'burger', 'salad', 'soup', 'curry', 'biryani', 'roti', 'dal', 'apple', 'banana', 'orange', 'mango', 'potato', 'tomato', 'onion', 'egg', 'milk', 'cheese', 'yogurt'];
    
    // Add Gemini results (most accurate - prioritize this)
    if (geminiFoodList && geminiFoodList.length > 0) {
      console.log('✅ Using Gemini detected foods:', geminiFoodList.length);
      geminiFoodList.forEach((item, index) => {
        const obj = visionObjects[index] || {};
        // Use Gemini's food name (already validated)
        allDetectedFoods.push({
          name: item.name.trim(), // Use exact name from Gemini
          confidence: Math.min(100, Math.max(0, item.confidence || 85)),
          x: obj.boundingPoly?.normalizedVertices?.[0]?.x * 100 || (20 + index * 10),
          y: obj.boundingPoly?.normalizedVertices?.[0]?.y * 100 || (25 + index * 10),
          width: obj.boundingPoly?.normalizedVertices?.[2]?.x ? 
            (obj.boundingPoly.normalizedVertices[2].x - obj.boundingPoly.normalizedVertices[0].x) * 100 : 35,
          height: obj.boundingPoly?.normalizedVertices?.[2]?.y ? 
            (obj.boundingPoly.normalizedVertices[2].y - obj.boundingPoly.normalizedVertices[0].y) * 100 : 40
        });
      });
    }
    
    // Add Vision API results if Gemini didn't work, but filter for food items only
    if (allDetectedFoods.length === 0 && visionObjects.length > 0) {
      console.log('⚠️ Using Vision API objects as fallback');
      visionObjects.forEach((obj, index) => {
        const objName = (obj.name || '').toLowerCase();
        const labelDesc = (visionLabels[index]?.description || '').toLowerCase();
        
        // Check if it's food-related
        const isFoodRelated = foodRelatedTerms.some(term => 
          objName.includes(term) || labelDesc.includes(term)
        );
        
        if (isFoodRelated || objName.length > 0) {
          // Use the most descriptive name
          const foodName = obj.name || visionLabels[index]?.description || 'Food Item';
          
          // Skip if it's clearly not food (generic terms)
          const lowerFoodName = foodName.toLowerCase();
          if (lowerFoodName !== 'food item' && lowerFoodName !== 'food' && lowerFoodName !== 'dish' && lowerFoodName !== 'meal') {
            allDetectedFoods.push({
              name: foodName,
              confidence: Math.round((obj.score || visionLabels[index]?.score || 0.8) * 100),
              x: obj.boundingPoly?.normalizedVertices?.[0]?.x * 100 || 20,
              y: obj.boundingPoly?.normalizedVertices?.[0]?.y * 100 || 25,
              width: obj.boundingPoly?.normalizedVertices?.[2]?.x ? 
                (obj.boundingPoly.normalizedVertices[2].x - obj.boundingPoly.normalizedVertices[0].x) * 100 : 35,
              height: obj.boundingPoly?.normalizedVertices?.[2]?.y ? 
                (obj.boundingPoly.normalizedVertices[2].y - obj.boundingPoly.normalizedVertices[0].y) * 100 : 40
            });
          }
        }
      });
    }
    
    // Fallback to labels if no objects, but filter for food-related labels only
    if (allDetectedFoods.length === 0 && visionLabels.length > 0) {
      console.log('⚠️ Using Vision API labels as fallback');
      visionLabels
        .filter(label => {
          const desc = label.description.toLowerCase();
          return foodRelatedTerms.some(term => desc.includes(term)) && 
                 !desc.includes('non-food') && 
                 desc !== 'food item';
        })
        .slice(0, 5)
        .forEach((label, index) => {
          allDetectedFoods.push({
            name: label.description,
            confidence: Math.round(label.score * 100),
            x: 20 + index * 15,
            y: 25 + index * 10,
            width: 35,
            height: 40
          });
        });
    }
    
    // If still no foods detected, use intelligent fallback based on image analysis
    if (allDetectedFoods.length === 0) {
      console.log('⚠️ No foods detected by APIs, using intelligent fallback');
      // Don't return fake data - return empty but with a note
      // The frontend can handle this gracefully
    }

    // Step 4: Validate detected foods are not generic before calculating nutrition
    const validFoods = allDetectedFoods.filter(food => {
      const name = food.name.toLowerCase();
      const invalidTerms = ['food item', 'food', 'dish', 'meal', 'item', 'object'];
      return !invalidTerms.includes(name);
    });
    
    // Step 5: Calculate nutrition from detected foods (use only valid foods)
    const nutritionData = calculateNutrition(validFoods.length > 0 ? validFoods : allDetectedFoods);
    
    // Step 6: Generate recommendations
    const recommendations = [];
    if (nutritionData.protein > 20) {
      recommendations.push('High protein meal');
    }
    if (nutritionData.fats > 15) {
      recommendations.push('Contains healthy fats');
    }
    if (nutritionData.fiber > 5) {
      recommendations.push('Good source of fiber');
    }
    if (nutritionData.calories > 600) {
      recommendations.push('High calorie meal - consider portion size');
    } else if (nutritionData.calories < 200) {
      recommendations.push('Light meal - may need additional calories');
    }
    if (nutritionData.identifiedFoods.length > 0) {
      recommendations.push(`${nutritionData.identifiedFoods.length} food items identified`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Balanced meal detected');
    }

    // Use valid foods (filtered earlier) or all detected foods if validation passed
    const finalDetectedFoods = validFoods.length > 0 ? validFoods : allDetectedFoods;
    
    // Only return data if we actually detected valid foods
    if (finalDetectedFoods.length === 0) {
      console.log('⚠️ No valid food items detected in image - returning empty result');
      return res.json({
        success: false,
        error: 'No food items detected in the image. Please ensure the image contains clearly visible food items (not just kitchen equipment, ovens, or utensils).',
        data: {
          detectedItems: [],
          nutrients: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sodium: 0,
            vitaminC: 0,
            iron: 0
          },
          calories: 0,
          confidence: 0,
          recommendations: [
            'Please try again with a clearer image of actual food items',
            'Make sure food is clearly visible in the image',
            'Avoid images with only kitchen equipment or empty plates'
          ],
          identifiedFoods: []
        }
      });
    }
    
    // Final validation - reject if only generic terms
    const hasSpecificFoods = finalDetectedFoods.some(f => {
      const name = f.name.toLowerCase();
      return !['food item', 'food', 'dish', 'meal', 'item', 'object'].includes(name);
    });
    
    if (!hasSpecificFoods) {
      console.log('⚠️ Only generic food terms detected - rejecting');
      return res.json({
        success: false,
        error: 'Could not identify specific food items in the image. Please try with a clearer image showing actual food.',
        data: {
          detectedItems: [],
          nutrients: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sodium: 0,
            vitaminC: 0,
            iron: 0
          },
          calories: 0,
          confidence: 0,
          recommendations: [
            'Please ensure food items are clearly visible',
            'Try taking a photo with better lighting',
            'Make sure the image shows actual food, not just equipment'
          ],
          identifiedFoods: []
        }
      });
    }
    
    const analysisResult = {
      detectedItems: finalDetectedFoods,
      nutrients: {
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
        fiber: nutritionData.fiber,
        sodium: nutritionData.sodium,
        vitaminC: nutritionData.vitaminC,
        iron: nutritionData.iron
      },
      calories: nutritionData.calories,
      confidence: Math.round(finalDetectedFoods.reduce((sum, item) => sum + item.confidence, 0) / finalDetectedFoods.length),
      recommendations,
      identifiedFoods: nutritionData.identifiedFoods
    };
    
    console.log('✅ Analysis complete:', {
      items: finalDetectedFoods.length,
      detectedFoods: finalDetectedFoods.map(f => f.name).join(', '),
      calories: nutritionData.calories,
      foods: nutritionData.identifiedFoods.map(f => f.name).join(', '),
      confidence: analysisResult.confidence
    });

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Try to provide partial results if we have some data
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your Google API key.',
        details: error.response?.data?.error?.message || error.message
      });
    }
    
    // Don't return fake data - return error instead
    console.error('❌ Food analysis failed completely');
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image. Please ensure the image contains visible food items and try again.',
      data: {
        detectedItems: [],
        nutrients: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          sodium: 0,
          vitaminC: 0,
          iron: 0
        },
        calories: 0,
        confidence: 0,
        recommendations: [
          'Please try again with a clearer image of food items',
          'Ensure good lighting and focus',
          'Make sure food items are clearly visible in the image'
        ]
      }
    });
  }
});

// Mock endpoint for testing (agar API key nahi hai)
router.post('/analyze-mock', upload.single('image'), async (req, res) => {
  // Mock response for testing
  const mockAnalysis = {
    detectedItems: [
      { name: 'Grilled Chicken', confidence: 94, x: 20, y: 25, width: 35, height: 40 },
      { name: 'Quinoa', confidence: 88, x: 58, y: 30, width: 30, height: 35 },
      { name: 'Avocado', confidence: 92, x: 15, y: 68, width: 25, height: 20 }
    ],
    nutrients: {
      calories: 520,
      protein: 18,
      carbs: 85,
      fats: 9,
      fiber: 12,
      sodium: 340,
      vitaminC: 45,
      iron: 3.2
    },
    calories: 520,
    confidence: 92,
    recommendations: [
      'High protein meal',
      'Healthy fats present',
      'Good source of fiber'
    ]
  };

  res.json({
    success: true,
    data: mockAnalysis
  });
});

export default router;

