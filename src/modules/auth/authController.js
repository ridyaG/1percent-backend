const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/database');

// Helper: generate tokens
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate input
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be 8+ characters' });
    }

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email or username already taken' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, displayName }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, username, displayName, avatarUrl: user.avatarUrl, currentStreak: user.currentStreak }, accessToken, refreshToken }
    });
  } catch (err) { next(err); }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    res.json({
      success: true,
      user: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, currentStreak: user.currentStreak },
      accessToken,
      refreshToken,
    });
  } catch (err) { next(err); }
};

// POST /auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Refresh token required' });

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const { accessToken, refreshToken } = generateTokens(stored.userId);
    await prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (err) { next(err); }
};

// POST /auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};
