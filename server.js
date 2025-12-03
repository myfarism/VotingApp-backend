require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const blockchainConfig = require('./src/config/blockchain');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const voteRoutes = require('./src/routes/voteRoutes');
const candidateRoutes = require('./src/routes/candidateRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // ✅ NEW

const app = express();

// Middleware
app.set('trust proxy', true);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(
  "/candidates",
  express.static(path.join(process.cwd(), "public", "candidates"))
);


// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable trust proxy validation
  },
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Voting API is running',
    mode: 'Pure Blockchain (No Database)',
    timestamp: new Date().toISOString(),
    blockchain: blockchainConfig.initialized ? 'Connected' : 'Not Connected',
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/vote`, voteRoutes);
app.use(`${apiPrefix}/candidates`, candidateRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes); // ✅ NEW

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Initialize blockchain and start server
async function startServer() {
  try {
    console.log('🚀 ======================================');
    console.log('🚀 Starting Voting API Server...');
    console.log('🚀 ======================================\n');

    await blockchainConfig.initialize();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log('\n✅ ======================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Mode: Pure Blockchain (No Database)`);
      console.log(`✅ API Prefix: ${apiPrefix}`);
      console.log('✅ ======================================\n');
      console.log('📋 Available endpoints:\n');
      
      console.log('🔐 Authentication:');
      console.log(`   POST   ${apiPrefix}/auth/register`);
      console.log(`   POST   ${apiPrefix}/auth/verify-otp`);
      console.log(`   POST   ${apiPrefix}/auth/resend-otp`);
      console.log(`   POST   ${apiPrefix}/auth/login`);
      console.log(`   GET    ${apiPrefix}/auth/profile`);
      console.log(`   POST   ${apiPrefix}/auth/change-password\n`);
      
      console.log('🗳️  Voting:');
      console.log(`   POST   ${apiPrefix}/vote/cast`);
      console.log(`   GET    ${apiPrefix}/vote/check`);
      console.log(`   GET    ${apiPrefix}/vote/status\n`);
      
      console.log('👥 Candidates:');
      console.log(`   GET    ${apiPrefix}/candidates`);
      console.log(`   GET    ${apiPrefix}/candidates/prodi/:prodi`);
      console.log(`   GET    ${apiPrefix}/candidates/results`);
      console.log(`   GET    ${apiPrefix}/candidates/results/prodi/:prodi\n`);
      
      console.log('📊 Audit:');
      console.log(`   GET    ${apiPrefix}/audit/stats`);
      console.log(`   GET    ${apiPrefix}/audit/log/:logId\n`);
      
      console.log('👑 Admin:');
      console.log(`   POST   ${apiPrefix}/admin/candidate`);
      console.log(`   PUT    ${apiPrefix}/admin/candidate/:id`);
      console.log(`   DELETE ${apiPrefix}/admin/candidate/:id`);
      console.log(`   POST   ${apiPrefix}/admin/session`);
      console.log(`   POST   ${apiPrefix}/admin/session/activate`);
      console.log(`   POST   ${apiPrefix}/admin/session/emergency-pause`);
      console.log(`   POST   ${apiPrefix}/admin/user/reset-password`);
      console.log(`   GET    ${apiPrefix}/admin/users/count`);
      console.log(`   GET    ${apiPrefix}/admin/wallet/:address`);
      console.log(`   GET    ${apiPrefix}/admin/wallet/admin/balance`);
      console.log(`   POST   ${apiPrefix}/admin/wallet/refund\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start server
startServer();
