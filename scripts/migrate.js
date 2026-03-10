const { execSync } = require('child_process');

const migrateUrl = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL;

execSync('npx prisma migrate deploy', { 
  stdio: 'inherit',
  env: { 
    ...process.env,
    DATABASE_URL: migrateUrl
  }
});