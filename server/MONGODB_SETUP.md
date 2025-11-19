# MongoDB Setup Guide

## MongoDB Connection String Setup

MongoDB me API key nahi hoti, **Connection String** use hota hai.

### Option 1: Local MongoDB (Recommended for Development)

1. **MongoDB Install karo:**
   - Download: https://www.mongodb.com/try/download/community
   - Install karo aur MongoDB service start karo

2. **Connection String:**
   ```
   mongodb://localhost:27017/nutrivision
   ```

3. **`.env` file me add karo:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/nutrivision
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **MongoDB Atlas Account banao:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Free account create karo

2. **Cluster create karo:**
   - "Build a Database" click karo
   - Free tier (M0) select karo
   - Region select karo (closest to you)
   - Cluster name: `nutrivision-cluster`

3. **Database User create karo:**
   - "Database Access" section me jao
   - "Add New Database User" click karo
   - Username aur Password set karo
   - "Read and write to any database" permission de do

4. **Network Access setup:**
   - "Network Access" section me jao
   - "Add IP Address" click karo
   - Development ke liye: `0.0.0.0/0` (Allow from anywhere)
   - Production me specific IPs add karo

5. **Connection String get karo:**
   - "Connect" button click karo
   - "Connect your application" select karo
   - Connection string copy karo:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nutrivision?retryWrites=true&w=majority
   ```
   - `username` aur `password` apne credentials se replace karo

6. **`.env` file me add karo:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrivision?retryWrites=true&w=majority
   ```

## Complete .env File Example

```env
# Server Configuration
PORT=5001

# JWT Secret
JWT_SECRET=nutrivision-secret-key-2024

# MongoDB Connection String
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/nutrivision

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrivision?retryWrites=true&w=majority

# Google API Key
GOOGLE_API_KEY=your-google-api-key-here
```

## Testing MongoDB Connection

1. **Backend start karo:**
   ```bash
   cd server
   npm start
   ```

2. **Check console logs:**
   - Agar connection successful hai to:
     ```
     ✅ MongoDB Connected: localhost:27017
     📊 Database: nutrivision
     ```

3. **Agar error aaye:**
   - MongoDB service running hai ya nahi check karo
   - Connection string sahi hai ya nahi verify karo
   - Network access (Atlas me) properly configured hai ya nahi check karo

## Important Notes

- **Local MongoDB:** Development ke liye best hai, fast aur free
- **MongoDB Atlas:** Production ke liye best hai, cloud-based, free tier available
- **Connection String:** `.env` file me `MONGODB_URI` variable me store hota hai
- **Security:** Production me strong password use karo aur IP whitelist karo

## Troubleshooting

### Error: "MongoDB connection error"
- MongoDB service running hai ya nahi check karo
- Connection string verify karo
- Firewall settings check karo

### Error: "Authentication failed" (Atlas)
- Username/password sahi hai ya nahi check karo
- Database user permissions check karo

### Error: "Network access denied" (Atlas)
- IP address whitelist me add karo
- `0.0.0.0/0` use karo for development (all IPs)

