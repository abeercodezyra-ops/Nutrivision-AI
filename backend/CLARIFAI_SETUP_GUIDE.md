# Clarifai Account Setup - Complete Guide (Hindi/Urdu)

## Step 1: Clarifai Account Banana

### 1.1 Sign Up
1. **Website pe jao:**
   - https://clarifai.com/ pe jao
   - Top right corner me **"Sign Up"** ya **"Get Started"** button click karo

2. **Account create karo:**
   - Email address enter karo
   - Password set karo (strong password use karo)
   - Terms & Conditions accept karo
   - **"Sign Up"** button click karo

3. **Email verification:**
   - Apne email inbox me verification email check karo
   - Email me verification link click karo
   - Account activate ho jayega

---

## Step 2: API Key Generate Karna

### 2.1 Dashboard me jao
1. Login ke baad **Dashboard** me automatically redirect ho jayega
2. Left sidebar me **"Settings"** ya **"Account"** section me jao

### 2.2 API Key Section
1. **"API Keys"** ya **"Personal Access Tokens"** section me jao
2. **"Create API Key"** ya **"Generate New Key"** button click karo

### 2.3 Key Details
1. **Key Name:** Kuch naam do (e.g., "NutriVision Food App")
2. **Scopes/Permissions:** 
   - ✅ **Predict** (required for food detection)
   - ✅ **Read** (to access models)
   - ✅ **All** (agar available ho to select karo)
3. **"Create"** ya **"Generate"** button click karo

### 2.4 Key Copy Karna
1. **Important:** API key sirf ek baar dikhayi jayegi
2. Key ko **immediately copy** karo
3. Safe jagah save karo (notepad me temporarily)

**⚠️ Warning:** Key ko share mat karo, public mat karo!

---

## Step 3: Food Models Access Check Karna

### 3.1 Models Section
1. Dashboard me **"Models"** ya **"Explore Models"** section me jao
2. Search bar me **"food"** type karo
3. Available food models dikhenge

### 3.2 Free Tier Models
Clarifai free tier me yeh models available hain:
- **food-item-recognition** (General food detection)
- **food-items-v1.0** (Updated food model)
- **food** (Basic food model)

### 3.3 Model Access Check
1. Koi bhi food model click karo
2. **"Use Model"** ya **"Try It"** button dikhega
3. Agar button available hai, to model accessible hai
4. Agar "Upgrade Required" dikhe, to account upgrade karna padega

---

## Step 4: Account Upgrade (Agar Required Ho)

### 4.1 Free Tier Limitations
- Limited API calls per month
- Basic models access
- Some advanced models require paid plan

### 4.2 Upgrade Options
1. Dashboard me **"Pricing"** ya **"Upgrade"** section me jao
2. Different plans available:
   - **Free Tier:** Basic access (usually sufficient for testing)
   - **Starter Plan:** More API calls
   - **Professional Plan:** Full access

### 4.3 Free Tier Check
- Pehle free tier me try karo
- Usually food models free tier me available hote hain
- Agar nahi, to Clarifai support se contact karo

---

## Step 5: API Key .env File Me Add Karna

### 5.1 .env File Open Karo
```bash
cd backend
# .env file open karo (notepad ya code editor me)
```

### 5.2 API Key Add Karo
```env
# Clarifai API Key (Food Recognition)
CLARIFAI_API_KEY=your-actual-clarifai-api-key-here

# Optional: User ID and App ID (usually not needed for public models)
# CLARIFAI_USER_ID=clarifai
# CLARIFAI_APP_ID=main
```

### 5.3 Save Karo
- File save karo
- Server restart karo

---

## Step 6: Test Karna

### 6.1 Test Script Run Karo
```bash
cd backend
node test-clarifai.js
```

### 6.2 Expected Output
Agar sab kuch sahi hai, to yeh dikhega:
```
✅ API Key is VALID!
✅ Model works: food-item-recognition
📥 Response Status: 200
✅ Clarifai API key is working correctly!
```

### 6.3 Agar Error Aaye
- **401/403 Error:** API key invalid hai
- **404 Error:** Model not found (try different model)
- **400 Error:** Request format galat hai

---

## Step 7: Alternative Solutions

### 7.1 Agar Clarifai Access Nahi Mile

**Option 1: Google Vision API (Already Available)**
- Aapke paas Google API key already hai
- Google Vision API food detection ke liye use kar sakte hain
- Code me Google Vision API enable karo

**Option 2: Other Food APIs**
- **Spoonacular API** (Free tier available)
- **Edamam Food Database API** (Free tier)
- **Nutritionix API** (Free tier)

### 7.2 Google Vision API Use Karna
Agar Clarifai access nahi mile, to Google Vision API use karo:
1. `.env` file me `GOOGLE_API_KEY` already hai
2. Code me Google Vision API enable karo
3. Food detection kaam karega

---

## Troubleshooting

### Problem: "Model does not exist"
**Solution:**
- Different model ID try karo
- `food-item-recognition` instead of `food-items-v1.0`
- Clarifai dashboard me available models check karo

### Problem: "Invalid API key"
**Solution:**
- API key sahi copy kiya hai?
- Spaces ya extra characters to nahi?
- `.env` file me properly save hua hai?
- Server restart kiya hai?

### Problem: "API key not found"
**Solution:**
- `.env` file me `CLARIFAI_API_KEY` variable name sahi hai?
- File location sahi hai? (`backend/.env`)
- `dotenv.config()` properly load ho raha hai?

### Problem: "Rate limit exceeded"
**Solution:**
- Free tier me limited calls hote hain
- Wait karo ya account upgrade karo
- Next month reset ho jayega

---

## Quick Checklist

- [ ] Clarifai account created
- [ ] Email verified
- [ ] API key generated
- [ ] API key copied and saved
- [ ] Food models accessible (checked in dashboard)
- [ ] API key `.env` file me added
- [ ] Server restarted
- [ ] Test script run kiya
- [ ] Test successful

---

## Support

Agar koi problem ho:
1. **Clarifai Documentation:** https://docs.clarifai.com/
2. **Clarifai Support:** support@clarifai.com
3. **Clarifai Community:** https://community.clarifai.com/

---

## Important Notes

1. **API Key Security:**
   - API key ko kabhi bhi public mat karo
   - GitHub me commit mat karo
   - `.env` file `.gitignore` me honi chahiye

2. **Free Tier Limits:**
   - Usually 1000-5000 calls per month
   - Rate limiting ho sakta hai
   - Production me paid plan consider karo

3. **Model Updates:**
   - Clarifai models update hote rehte hain
   - Model IDs change ho sakte hain
   - Documentation check karte raho

---

## Next Steps

1. Clarifai account banao
2. API key generate karo
3. `.env` file me add karo
4. Test karo
5. Agar kaam kare, to production me use karo
6. Agar nahi, to Google Vision API use karo (already available)

