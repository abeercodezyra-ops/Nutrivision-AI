# OAuth Setup Instructions

## Google OAuth Setup

1. **Google Cloud Console me jao:**
   - https://console.cloud.google.com/

2. **New Project banao** (ya existing use karo)

3. **OAuth Consent Screen configure karo:**
   - APIs & Services > OAuth consent screen
   - User type: External
   - App name: NutriVision.ai
   - User support email: apna email
   - Developer contact: apna email

4. **Credentials create karo:**
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Name: NutriVision Web Client
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`

5. **Client ID copy karo** aur `.env` file me add karo:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

## Apple Sign In Setup

1. **Apple Developer Account me jao:**
   - https://developer.apple.com/

2. **App ID create karo:**
   - Certificates, Identifiers & Profiles
   - Identifiers > App IDs
   - Sign In with Apple capability enable karo

3. **Service ID create karo:**
   - Identifiers > Services IDs
   - Return URLs: `http://localhost:3000`

4. **Client ID copy karo** aur `.env` file me add karo:
   ```
   VITE_APPLE_CLIENT_ID=your-apple-client-id-here
   ```

## Environment Variables

Root folder me `.env` file banao:

```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id
```

## Note

- Development me OAuth properly work karne ke liye proper credentials chahiye
- Production me HTTPS required hai
- Google aur Apple ke credentials setup karein

