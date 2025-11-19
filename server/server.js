import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import foodAnalysisRoutes from './routes/foodAnalysis.js';
import chatbotRoutes from './routes/chatbot.js';
import authRoutes from './routes/auth.js';
import mealRoutes from './routes/meals.js';
import oauthRoutes from './routes/oauth.js';

dotenv.config();

// Connect to MongoDB (non-blocking - server will start even if MongoDB fails)
connectDB().catch(err => {
  console.error('MongoDB connection failed, continuing without database...');
});

// Verify environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key') {
  console.warn('⚠️  WARNING: JWT_SECRET not set or using default. Please set JWT_SECRET in .env file.');
} else {
  console.log('✅ JWT_SECRET loaded');
}

const app = express();
// Ensure PORT is a valid number
const PORT = Number(process.env.PORT) || 5001; // Changed to 5001 as 5000 might be in use

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/food-analysis', foodAnalysisRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes (Google, Apple)
app.use('/api/meals', mealRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NutriVision API is running' });
});

// Start server with error handling
const startServer = (port) => {
  // Ensure port is a number and within valid range
  const portNumber = Number(port);
  
  if (isNaN(portNumber) || portNumber < 0 || portNumber >= 65536) {
    console.error(`❌ Invalid port number: ${port}. Port must be between 0 and 65535.`);
    console.error(`💡 Using default port 5001...`);
    startServer(5001);
    return;
  }
  
  const server = app.listen(portNumber, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://localhost:${portNumber}`);
    console.log(`📡 API available at http://localhost:${portNumber}/api`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
      console.error(`❌ Port ${portNumber} is already in use or permission denied.`);
      
      // Try next port (max 5 attempts to avoid infinite loop)
      const nextPort = portNumber + 1;
      if (nextPort < 65536 && nextPort < portNumber + 10) {
        console.error(`💡 Trying alternative port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error(`❌ Could not find available port. Please free up port ${portNumber} or use a different port.`);
        console.error(`💡 You can set PORT environment variable: PORT=5002 node server.js`);
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });
};

startServer(PORT);

