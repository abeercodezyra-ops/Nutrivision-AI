import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY || process.env.CLARIFAI_KEY;

console.log('🔍 Testing Clarifai API Key...\n');

if (!CLARIFAI_API_KEY) {
  console.error('❌ CLARIFAI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('✅ API Key found:', CLARIFAI_API_KEY.substring(0, 10) + '...' + CLARIFAI_API_KEY.substring(CLARIFAI_API_KEY.length - 4));
console.log('📏 API Key length:', CLARIFAI_API_KEY.length);
console.log('');

// Clarifai API v2 configuration (from official Clarifai example)
const CLARIFAI_USER_ID = process.env.CLARIFAI_USER_ID || 'clarifai';
const CLARIFAI_APP_ID = process.env.CLARIFAI_APP_ID || 'main';
const MODEL_ID = process.env.CLARIFAI_MODEL_ID || 'food-item-v1-clustering';
const MODEL_VERSION_ID = process.env.CLARIFAI_MODEL_VERSION_ID || 'cc367be194cf45149e75f01d59f77ba7';

// Use actual food image URL for testing (from Clarifai example)
// Or use a proper food image base64
const testImageUrl = 'https://samples.clarifai.com/food.jpg';

async function testClarifaiAPI() {
  console.log('🧪 Testing API key with Clarifai...\n');
  
  // Use the correct model from Clarifai example
  const testUrl = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`;
  
  console.log(`Testing model: ${MODEL_ID}`);
  console.log(`Version: ${MODEL_VERSION_ID}`);
  console.log(`URL: ${testUrl.replace(CLARIFAI_API_KEY, '***')}\n`);
  
  try {
    const response = await axios.post(testUrl, {
      user_app_id: {
        user_id: CLARIFAI_USER_ID,
        app_id: CLARIFAI_APP_ID
      },
      inputs: [{
        data: {
          image: {
            url: testImageUrl
          }
        }
      }]
    }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Key ${CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Key is VALID!');
    console.log('✅ Model works:', MODEL_ID);
    console.log('📥 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
    console.log('\n✅ Clarifai API key is working correctly!');
    console.log(`💡 Model: ${MODEL_ID}`);
    console.log(`💡 Version: ${MODEL_VERSION_ID}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ API Key Test FAILED!');
    console.error('Status:', error.response?.status || 'No status');
    console.error('Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('\n❌ Invalid API Key!');
      console.error('💡 Please check your CLARIFAI_API_KEY in .env file');
      console.error('💡 Get a valid key from: https://clarifai.com/');
    } else if (error.response?.status === 404) {
      console.error('\n❌ Model not found!');
      console.error('💡 Check MODEL_ID and MODEL_VERSION_ID in .env file');
    } else {
      console.error('\n❌ API Error:', error.message);
    }
    
    process.exit(1);
  }
}

testClarifaiAPI();
