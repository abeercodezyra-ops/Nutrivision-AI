# Quick Setup - Clarifai API Key

## Agar Clarifai Access Nahi Hai, To Google Vision API Use Karo

Aapke paas Google API key already hai. Main code update kar deta hoon taaki Google Vision API use ho.

## Option 1: Google Vision API Use Karna (Recommended - Already Available)

Aapke paas Google API key already hai:
- `GOOGLE_API_KEY=4bcab4a097b941feae628dd32b2594c8`

Yeh key food detection ke liye use kar sakte hain.

## Option 2: Clarifai Setup Karna

Agar Clarifai use karna hai:
1. https://clarifai.com/ pe sign up karo
2. Dashboard → Settings → API Keys
3. New API key generate karo
4. `.env` file me add karo:
   ```
   CLARIFAI_API_KEY=your-clarifai-api-key
   ```

## Current Status

- ✅ Google API key available
- ❌ Clarifai API key invalid/not accessible
- ✅ Code ready for both APIs

## Recommendation

Google Vision API use karo kyunki:
- Already available hai
- Food detection kaam karta hai
- No additional setup needed

