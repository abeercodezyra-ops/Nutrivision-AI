# Clarifai API Integration Guide

## Overview
Clarifai Food Model integration add kar diya gaya hai food analysis ke liye. Clarifai food recognition ke liye specialized hai aur better results deta hai.

## Setup Instructions

### 1. Clarifai API Key Kaise Get Karein

1. **Clarifai Account Banao:**
   - https://www.clarifai.com/ pe jao
   - Sign up karo (free tier available)

2. **API Key Generate Karo:**
   - Dashboard me jao
   - Settings > API Keys section
   - New API Key create karo
   - API key copy karo

### 2. .env File Me API Key Add Karein

`.env` file me yeh line add karein:

```env
# Clarifai API Key (Food Recognition)
CLARIFAI_API_KEY=your-clarifai-api-key-here
```

Ya:

```env
CLARIFAI_KEY=your-clarifai-api-key-here
```

### 3. API Priority

Code me API priority yeh hai:

1. **Clarifai** (Priority 1) - Food recognition ke liye best
2. **Google Gemini** (Priority 2) - Agar Clarifai fail ho
3. **Google Vision** (Priority 3) - Last resort

### 4. Clarifai Food Model

Code me **food-item-recognition** model use ho raha hai:
- Model ID: `food-item-recognition`
- Endpoint: `https://api.clarifai.com/v2/models/food-item-recognition/outputs`
- Confidence threshold: 30% (0.3)

### 5. Testing

Server restart karein:
```bash
cd backend
node server.js
```

Food image upload karke test karein. Logs me dikhega:
- `✅ Clarifai detected: X food items`
- `📋 Foods: [food names with confidence]`

## Code Changes

### Files Modified:
- `backend/routes/foodAnalysis.js` - Clarifai integration add kiya

### Key Features:
- ✅ Clarifai API support
- ✅ Automatic fallback to Google APIs
- ✅ Better food recognition accuracy
- ✅ Confidence-based filtering

## API Response Format

Clarifai se response aata hai:
```json
{
  "outputs": [{
    "data": {
      "concepts": [
        {
          "name": "pizza",
          "value": 0.95
        },
        {
          "name": "chicken",
          "value": 0.87
        }
      ]
    }
  }]
}
```

Code automatically convert karta hai:
```json
{
  "name": "pizza",
  "confidence": 95,
  "x": 20,
  "y": 25,
  "width": 35,
  "height": 40
}
```

## Troubleshooting

### Error: "Invalid API key"
- Check karein `.env` file me `CLARIFAI_API_KEY` sahi hai
- API key me spaces nahi hone chahiye
- Server restart karein after adding key

### Error: "Clarifai API error"
- Check karein internet connection
- Clarifai account active hai
- API key valid hai

### No foods detected
- Image me food clearly visible hai?
- Try karein better lighting ke saath
- Image quality check karein

## Benefits of Clarifai

1. **Better Accuracy** - Food recognition me specialized
2. **Faster Response** - Optimized for food images
3. **Free Tier** - Limited free requests available
4. **Easy Integration** - Simple API

## Next Steps

1. `.env` file me `CLARIFAI_API_KEY` add karein
2. Server restart karein
3. Food image upload karke test karein
4. Logs check karein for Clarifai detection

