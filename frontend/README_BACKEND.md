# NutriVision.ai Backend Setup

## Installation

1. **Backend dependencies install karein:**
```bash
cd server
npm install
```

2. **Environment variables setup:**
   - `server/.env` file me apni API keys add karein:
   - `FOOD_ANALYSIS_API_KEY` - Food analysis API key
   - `CHATBOT_API_KEY` - Chatbot API key (OpenAI, Anthropic, etc.)
   - `JWT_SECRET` - JWT token secret (production me strong secret use karein)

3. **Backend server start karein:**
```bash
cd server
npm run dev
```

Backend server `http://localhost:5001` par chalega (port 5000 Windows me reserved hai).

## API Endpoints

### Food Analysis
- `POST /api/food-analysis/analyze` - Food image analyze karega
- `POST /api/food-analysis/analyze-mock` - Mock response (testing ke liye)

### Chatbot
- `POST /api/chatbot/message` - Chatbot se message send karega
- `GET /api/chatbot/suggestions` - Chatbot suggestions

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Meals
- `GET /api/meals/history` - User ka meal history
- `POST /api/meals/add` - Meal add karega
- `GET /api/meals/stats` - Meal statistics

## Frontend Setup

1. **Frontend dependencies install karein:**
```bash
npm install
```

2. **Environment variables (optional):**
   - `.env` file me `VITE_API_URL=http://localhost:5001/api` add karein (default already set hai)

3. **Frontend start karein:**
```bash
npm run dev
```

Frontend `http://localhost:3000` par chalega.

## API Integration

Aap apni AI APIs integrate kar sakte hain:

1. **Food Analysis API:**
   - `server/routes/foodAnalysis.js` me `FOOD_ANALYSIS_API_URL` aur `FOOD_ANALYSIS_API_KEY` update karein
   - Agar API key nahi hai, to mock endpoint use hoga automatically

2. **Chatbot API:**
   - `server/routes/chatbot.js` me `CHATBOT_API_URL` aur `CHATBOT_API_KEY` update karein
   - OpenAI, Anthropic, ya koi bhi chatbot API use kar sakte hain

## Notes

- Backend abhi in-memory storage use kar raha hai (production me database add karein)
- JWT tokens 7 days ke liye valid hain
- CORS enabled hai for development
- Mock endpoints available hain agar real APIs nahi hain

