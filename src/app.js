require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

const { startScheduler } = require('./jobs/scheduler');


// ── Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────
app.use('/api/v1/auth', require('./modules/auth/authRoutes'));
app.use('/api/v1/users', require('./modules/users/userRoutes'));
app.use('/api/v1/posts', require('./modules/posts/postRoutes'));

// Make io accessible to route handlers
app.set('io', io);

// Socket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User joins their personal room for notifications
  socket.on('join_room', ({ userId }) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

startScheduler();

// ── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
  });
});

// ── Start Server ─────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // export for tests