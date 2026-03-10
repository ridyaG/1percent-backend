const { execSync } = require('child_process');

const migrateUrl = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL;

execSync('npx prisma migrate deploy', { 
  stdio: 'inherit',
  env: { 
    ...process.env,
    DATABASE_URL: migrateUrl
  }
});

DATABASE_URL_EXTERNAL = "postgresql://postgresql_nq2k_user:pCWz2FGP26mFCxVWeG8nsaKSo7hxxbK6@dpg-d6o74a2a214c73f3urqg-a.oregon-postgres.render.com/postgresql_nq2k"