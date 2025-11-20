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
  
  const cleaned = normalized
    .replace(/\s*(cooked|fried|grilled|baked|boiled|steamed|raw|fresh|dried)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (foodNutritionDB[cleaned]) {
    return foodNutritionDB[cleaned];
  }
  
  if (foodNutritionDB[normalized]) {
    return foodNutritionDB[normalized];
  }
  
  for (const [key, value] of Object.entries(foodNutritionDB)) {
    if (cleaned.includes(key) || normalized.includes(key)) {
      return value;
    }
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
  
  for (const item of foodItems) {
    const foodName = item.name.toLowerCase().trim();
    
    if (foodName === 'food item' || foodName === 'food' || foodName === 'dish' || foodName === 'meal') {
      continue;
    }
    
    const nutrition = findFoodInDB(foodName);
    
    if (nutrition) {
      let basePortion = 150;
      
      if (foodName.includes('biryani') || foodName.includes('curry') || foodName.includes('pulao')) {
        basePortion = 250;
      } else if (foodName.includes('roti') || foodName.includes('naan') || foodName.includes('chapati')) {
        basePortion = 50;
      } else if (foodName.includes('dal') || foodName.includes('sabzi')) {
        basePortion = 150;
      } else if (foodName.includes('fruit') || foodName.includes('apple') || foodName.includes('banana')) {
        basePortion = 100;
      }
      
      const confidenceMultiplier = 0.7 + (item.confidence / 100) * 0.3;
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
        name: item.name,
        nutrition: { calories, protein, carbs, fats, fiber, sodium, vitaminC, iron }
      });
    } else {
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

// Helper function to extract concepts from Clarifai response
function extractConceptsFromClarifai(output) {
  let concepts = [];
  
  // Try different response structures
  if (output.data?.concepts && Array.isArray(output.data.concepts)) {
    console.log('✅ Found direct concepts');
    concepts = output.data.concepts;
  } else if (output.data?.clusters && Array.isArray(output.data.clusters)) {
    console.log('✅ Found clusters, extracting concepts...');
    output.data.clusters.forEach((cluster) => {
      if (cluster.concepts && Array.isArray(cluster.concepts)) {
        concepts = concepts.concat(cluster.concepts);
      }
      // Some clusters might have direct concept data
      if (cluster.id && cluster.value) {
        concepts.push({ name: cluster.id, value: cluster.value });
      }
    });
  } else if (output.data?.regions && Array.isArray(output.data.regions)) {
    console.log('✅ Found regions, extracting concepts...');
    output.data.regions.forEach(region => {
      if (region.data?.concepts && Array.isArray(region.data.concepts)) {
        concepts = concepts.concat(region.data.concepts);
      }
    });
  } else {
    // Try to find concepts anywhere in the output
    console.log('⚠️ No standard structure found, searching for concepts...');
    const outputStr = JSON.stringify(output);
    if (outputStr.includes('concepts')) {
      console.log('⚠️ Found "concepts" in response but structure is unexpected');
    }
  }
  
  return concepts;
}

// Helper function to call Clarifai API
async function callClarifaiAPI(imageBase64, apiKey, userId, appId, modelId, modelVersionId) {
  const clarifaiUrl = `https://api.clarifai.com/v2/models/${modelId}/versions/${modelVersionId}/outputs`;
  
  console.log('🔗 Clarifai URL:', clarifaiUrl);
  console.log('📌 Model:', modelId);
  console.log('📌 Version:', modelVersionId);
  
  try {
    const response = await axios.post(clarifaiUrl, {
      user_app_id: {
        user_id: userId,
        app_id: appId
      },
      inputs: [{
        data: {
          image: {
            base64: imageBase64
          }
        }
      }]
    }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

// Helper function to call Google Vision API
async function callGoogleVisionAPI(imageBase64, apiKey) {
  const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  try {
    const response = await axios.post(visionUrl, {
        requests: [{
        image: { content: imageBase64 },
          features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 }
          ]
        }]
      }, {
        timeout: 30000
      });

    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

// Main Food Analysis endpoint
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY || process.env.CLARIFAI_KEY;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.FOOD_ANALYSIS_API_KEY;
    
    if (!CLARIFAI_API_KEY && !GOOGLE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'API key is required. Please set CLARIFAI_API_KEY or GOOGLE_API_KEY in .env file.'
      });
    }

    const imageBase64 = req.file.buffer.toString('base64');
    
    console.log('\n🔍 ===== FOOD ANALYSIS STARTED =====');
    console.log('📸 Image size:', req.file.size, 'bytes');
    console.log('📸 Image type:', req.file.mimetype);
    console.log('🔑 Clarifai API Key:', CLARIFAI_API_KEY ? '✅ Found' : '❌ Not found');
    console.log('🔑 Google API Key:', GOOGLE_API_KEY ? '✅ Found' : '❌ Not found');

    let detectedFoods = [];
    let usedAPI = 'none';

    // Step 1: Try Clarifai API first
    if (CLARIFAI_API_KEY) {
      console.log('\n🍽️ Trying Clarifai API...');
      
      // Default values work for public Clarifai models
      // You only need to set these in .env if using your own custom model
      const CLARIFAI_USER_ID = process.env.CLARIFAI_USER_ID || 'clarifai';
      const CLARIFAI_APP_ID = process.env.CLARIFAI_APP_ID || 'main';
      const MODEL_ID = process.env.CLARIFAI_MODEL_ID || 'food-item-v1-clustering';
      const MODEL_VERSION_ID = process.env.CLARIFAI_MODEL_VERSION_ID || 'cc367be194cf45149e75f01d59f77ba7';
      
      console.log('📌 Using defaults (no need to set in .env for public models):');
      console.log('   USER_ID:', CLARIFAI_USER_ID);
      console.log('   APP_ID:', CLARIFAI_APP_ID);
      console.log('   MODEL_ID:', MODEL_ID);
      console.log('   MODEL_VERSION_ID:', MODEL_VERSION_ID);
      
      const clarifaiResult = await callClarifaiAPI(imageBase64, CLARIFAI_API_KEY, CLARIFAI_USER_ID, CLARIFAI_APP_ID, MODEL_ID, MODEL_VERSION_ID);
      
      if (clarifaiResult.success && clarifaiResult.data?.outputs?.[0]) {
        const output = clarifaiResult.data.outputs[0];
        
        console.log('📥 Clarifai Response Status: 200 OK');
        console.log('📥 Full Response Structure:', JSON.stringify(output, null, 2).substring(0, 1000));
        
        const concepts = extractConceptsFromClarifai(output);
        
        console.log('🔍 Total concepts extracted:', concepts.length);
        if (concepts.length > 0) {
          console.log('🔍 First 10 concepts:', 
            concepts.slice(0, 10).map(c => `${c.name || c.id || 'unknown'}: ${((c.value || c.score || 0) * 100).toFixed(1)}%`).join(', '));
        }
        
        // Filter and process concepts - VERY LENIENT FILTERING
        console.log('\n🔍 Filtering concepts...');
        console.log('📋 All concepts before filtering:', 
          concepts.map(c => `${c.name || c.id || 'unknown'}: ${((c.value || c.score || 0) * 100).toFixed(1)}%`).join(', '));
        
        detectedFoods = concepts
          .filter(concept => {
            const confidence = concept.value || concept.score || 0;
            const name = (concept.name || concept.id || '').toLowerCase();
            
            // VERY LOW threshold: 10% confidence (accept almost everything)
            if (confidence < 0.10) {
              console.log(`  ❌ Low confidence rejected: ${name} (${(confidence * 100).toFixed(1)}%)`);
              return false;
            }
            
            // ONLY filter out VERY obvious non-food items (minimal list)
            const strictNonFoodTerms = ['person', 'people', 'hand', 'finger'];
            if (strictNonFoodTerms.some(term => name === term || name.includes(term))) {
              console.log(`  ❌ Non-food rejected: ${name}`);
              return false;
            }
            
            // ACCEPT everything else (including bowl, plate, dish, etc. as they might be food context)
            console.log(`  ✅ Accepted: ${name} (${(confidence * 100).toFixed(1)}%)`);
            return true;
          })
          .sort((a, b) => {
            const confA = a.value || a.score || 0;
            const confB = b.value || b.score || 0;
            return confB - confA;
          })
          .slice(0, 10)
          .map((concept, index) => ({
            name: concept.name || concept.id || 'Food Item',
            confidence: Math.round((concept.value || concept.score || 0) * 100),
            x: 20 + index * 15,
            y: 25 + index * 10,
            width: 35,
            height: 40
          }));
        
        if (detectedFoods.length > 0) {
          usedAPI = 'clarifai';
          console.log('\n✅ Clarifai detected:', detectedFoods.length, 'food items');
          console.log('📋 Final Foods:', detectedFoods.map(f => `${f.name} (${f.confidence}%)`).join(', '));
        } else {
          console.log('\n⚠️ Clarifai returned concepts but none passed filtering');
          console.log('💡 This means all concepts were below 10% confidence or were filtered as non-food');
          console.log('💡 Check the "All concepts before filtering" log above to see what was detected');
        }
      } else {
        console.error('❌ Clarifai API failed:', clarifaiResult.error);
        console.error('Status:', clarifaiResult.status);
        console.error('Data:', JSON.stringify(clarifaiResult.data, null, 2).substring(0, 500));
      }
    }

    // Step 2: If Clarifai failed or returned no results, try Google Vision
    if (detectedFoods.length === 0 && GOOGLE_API_KEY) {
      console.log('\n🔄 Trying Google Vision API as fallback...');
      console.log('⚠️ Note: Google Vision API requires proper API key with Vision API enabled');
      console.log('⚠️ 403 error means API key is invalid or Vision API is not enabled');
      
      const visionResult = await callGoogleVisionAPI(imageBase64, GOOGLE_API_KEY);
      
      if (visionResult.success && visionResult.data?.responses?.[0]) {
        const response = visionResult.data.responses[0];
        const labels = response.labelAnnotations || [];
        const objects = response.localizedObjectAnnotations || [];
        
        console.log('✅ Google Vision detected:', labels.length, 'labels,', objects.length, 'objects');
        
        const foodRelatedTerms = ['food', 'dish', 'meal', 'cuisine', 'recipe', 'cooking', 'breakfast', 'lunch', 'dinner', 'snack', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'rice', 'bread', 'pasta', 'pizza', 'burger', 'salad', 'soup', 'curry', 'biryani', 'roti', 'dal', 'apple', 'banana', 'orange', 'mango', 'potato', 'tomato', 'onion', 'egg', 'milk', 'cheese', 'yogurt', 'quinoa', 'avocado', 'granola', 'smoothie'];
        
        labels
        .filter(label => {
          const desc = label.description.toLowerCase();
          return foodRelatedTerms.some(term => desc.includes(term)) && 
                 !desc.includes('non-food') && 
                   desc !== 'food item' &&
                   label.score >= 0.3;
        })
          .slice(0, 10)
        .forEach((label, index) => {
            detectedFoods.push({
            name: label.description,
            confidence: Math.round(label.score * 100),
            x: 20 + index * 15,
            y: 25 + index * 10,
            width: 35,
            height: 40
          });
        });
        
        if (detectedFoods.length > 0) {
          usedAPI = 'google';
          console.log('✅ Google Vision detected:', detectedFoods.length, 'food items');
          console.log('📋 Foods:', detectedFoods.map(f => `${f.name} (${f.confidence}%)`).join(', '));
        }
      } else {
        console.error('❌ Google Vision API failed:', visionResult.error);
        console.error('Status:', visionResult.status);
        if (visionResult.status === 403) {
          console.error('💡 403 Forbidden: Check if:');
          console.error('   1. Google Vision API is enabled in Google Cloud Console');
          console.error('   2. API key has Vision API permissions');
          console.error('   3. API key is not restricted or expired');
        }
      }
    }

    // Step 3: If still no foods detected, return error
    if (detectedFoods.length === 0) {
      console.log('❌ No food items detected by any API');
      return res.json({
        success: false,
        error: 'No food items detected in the image. Please ensure the image contains clearly visible food items.',
        data: {
          detectedItems: [],
          nutrients: {
            calories: 0, protein: 0, carbs: 0, fats: 0,
            fiber: 0, sodium: 0, vitaminC: 0, iron: 0
          },
          calories: 0,
          confidence: 0,
          recommendations: [
            'Please try again with a clearer image of food items',
            'Ensure good lighting and focus',
            'Make sure food items are clearly visible in the image'
          ],
          identifiedFoods: []
        }
      });
    }

    // Step 4: Filter out generic terms
    const validFoods = detectedFoods.filter(food => {
      const name = food.name.toLowerCase();
      const invalidTerms = ['food item', 'food', 'dish', 'meal', 'item', 'object'];
      return !invalidTerms.includes(name);
    });
    
    const finalFoods = validFoods.length > 0 ? validFoods : detectedFoods;

    // Step 5: Calculate nutrition
    const nutritionData = calculateNutrition(finalFoods);
    
    // Step 6: Generate recommendations
    const recommendations = [];
    if (nutritionData.protein > 20) recommendations.push('High protein meal');
    if (nutritionData.fats > 15) recommendations.push('Contains healthy fats');
    if (nutritionData.fiber > 5) recommendations.push('Good source of fiber');
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

    // Step 7: Return results
    const analysisResult = {
      detectedItems: finalFoods,
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
      confidence: Math.round(finalFoods.reduce((sum, item) => sum + item.confidence, 0) / finalFoods.length),
      recommendations,
      identifiedFoods: nutritionData.identifiedFoods
    };
    
    console.log('\n✅ ===== ANALYSIS COMPLETE =====');
    console.log('📊 Used API:', usedAPI);
    console.log('📊 Items:', finalFoods.length);
    console.log('📊 Foods:', finalFoods.map(f => f.name).join(', '));
    console.log('📊 Calories:', nutritionData.calories);
    console.log('=================================\n');

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('\n❌ ===== FOOD ANALYSIS ERROR =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('=================================\n');
    
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image. Please try again.',
      details: error.message
    });
  }
});

// Mock endpoint for testing
router.post('/analyze-mock', upload.single('image'), async (req, res) => {
  const mockAnalysis = {
    detectedItems: [
      { name: 'Grilled Chicken', confidence: 94, x: 20, y: 25, width: 35, height: 40 },
      { name: 'Quinoa', confidence: 88, x: 58, y: 30, width: 30, height: 35 },
      { name: 'Avocado', confidence: 92, x: 15, y: 68, width: 25, height: 20 }
    ],
    nutrients: {
      calories: 520, protein: 18, carbs: 85, fats: 9,
      fiber: 12, sodium: 340, vitaminC: 45, iron: 3.2
    },
    calories: 520,
    confidence: 92,
    recommendations: ['High protein meal', 'Healthy fats present', 'Good source of fiber']
  };

  res.json({
    success: true,
    data: mockAnalysis
  });
});

export default router;
