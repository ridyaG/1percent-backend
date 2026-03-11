const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  // Render Postgres usually requires SSL for external connections
  ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

module.exports = prisma;