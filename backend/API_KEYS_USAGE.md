# API Keys Usage Documentation

## Overview
Yeh document batata hai ki project me kaunsi API keys use ho rahi hain aur kahan use ho rahi hain.

---

## 1. **GOOGLE_API_KEY** / **FOOD_ANALYSIS_API_KEY**

### Location: `backend/routes/foodAnalysis.js`

### Use Cases:
1. **Google Vision API** - Food image analysis ke liye
   - Image se food items detect karta hai
   - Labels, objects, aur text detect karta hai
   - Endpoint: `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`

2. **Google Gemini API** - Advanced food identification ke liye
   - Vision API se better food recognition
   - Multiple endpoints try karta hai:
     - `generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
     - `generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`
     - `generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent`

### Code Reference:
```javascript
// Line 284-320 in foodAnalysis.js
const API_KEY = process.env.GOOGLE_API_KEY || process.env.FOOD_ANALYSIS_API_KEY;
const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
```

### Features:
- Food items ko image se identify karta hai
- Nutrition information calculate karta hai
- Food recommendations deta hai

---

## 2. **CHATBOT_API_KEY** / **GOOGLE_API_KEY**

### Location: `backend/routes/chatbot.js`

### Use Cases:
1. **Google Gemini API** - Chatbot responses ke liye
   - User ke nutrition questions ka answer deta hai
   - Personalized advice deta hai (user ke meal history ke basis pe)
   - Endpoint: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

### Code Reference:
```javascript
// Line 37-200 in chatbot.js
const API_KEY = process.env.GOOGLE_API_KEY || process.env.CHATBOT_API_KEY || 'AIzaSyCRnBKkfb-QJCqKvv6Vtq0HCHE3VVf9cf0';
const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
```

### Features:
- Nutrition questions ka answer
- Meal history ke basis pe personalized advice
- Food recommendations
- Health tips

---

## 3. **JWT_SECRET**

### Location: Multiple files
- `backend/routes/auth.js`
- `backend/routes/chatbot.js`
- `backend/routes/oauth.js`
- `backend/server.js`

### Use Cases:
1. **JWT Token Signing** - User authentication ke liye
   - Login/Register ke baad token generate karta hai
   - Token verify karta hai protected routes ke liye
   - Token expiration: 7 days

### Code Reference:
```javascript
// Line 52-56 in auth.js
const token = jwt.sign(
  { userId: user._id.toString(), email: user.email },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '7d' }
);
```

### Features:
- User authentication
- Protected routes access
- Session management

---

## 4. **MONGODB_URI**

### Location: `backend/config/database.js`

### Use Cases:
1. **MongoDB Database Connection** - Data storage ke liye
   - User data store karta hai
   - Meal history store karta hai
   - Local ya Atlas MongoDB connect karta hai

### Code Reference:
```javascript
// Line 6-10 in database.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrivision';
const conn = await mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Features:
- User registration/login data
- Meal history storage
- User statistics

---

## Summary Table

| API Key | Service | Used In | Purpose |
|---------|---------|---------|---------|
| `GOOGLE_API_KEY` | Google Vision API | `foodAnalysis.js` | Food image detection |
| `GOOGLE_API_KEY` | Google Gemini API | `foodAnalysis.js` | Advanced food identification |
| `CHATBOT_API_KEY` | Google Gemini API | `chatbot.js` | Chatbot responses |
| `JWT_SECRET` | JWT | `auth.js`, `oauth.js` | User authentication |
| `MONGODB_URI` | MongoDB | `database.js` | Database connection |

---

## Environment Variables Priority

### For Food Analysis:
1. `GOOGLE_API_KEY` (first priority)
2. `FOOD_ANALYSIS_API_KEY` (fallback)

### For Chatbot:
1. `GOOGLE_API_KEY` (first priority)
2. `CHATBOT_API_KEY` (fallback)
3. Hardcoded fallback key (last resort - not recommended)

---

## Important Notes

1. **API Key Security:**
   - API keys `.env` file me store hain
   - `.env` file git me commit nahi honi chahiye
   - Production me environment variables use karein

2. **Fallback Behavior:**
   - Agar API key nahi hai, to mock responses return hote hain
   - Production me API keys zaroori hain

3. **Rate Limits:**
   - Google APIs ki rate limits check karein
   - Free tier me limited requests hote hain

4. **Error Handling:**
   - API key invalid ho to proper error messages show hote hain
   - 401/403 errors handle kiye gaye hain

---

## How to Get API Keys

### Google API Key:
1. Google Cloud Console me jao: https://console.cloud.google.com/
2. New project banao
3. APIs enable karo:
   - Vision API
   - Gemini API
4. API key generate karo
5. `.env` file me add karo

### MongoDB URI:
1. MongoDB Atlas account banao: https://www.mongodb.com/cloud/atlas
2. Cluster create karo
3. Connection string copy karo
4. `.env` file me add karo

---

## Current Configuration

Based on `.env` file:
- ✅ `GOOGLE_API_KEY`: Set (for Vision API)
- ✅ `CHATBOT_API_KEY`: Set (for Gemini API)
- ✅ `JWT_SECRET`: Set
- ✅ `MONGODB_URI`: Set (MongoDB Atlas)

