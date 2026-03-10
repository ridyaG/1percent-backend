const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123', 12);

  const alex = await prisma.user.create({
    data: {
      username: 'alexmercer',
      email: 'alex@example.com',
      passwordHash: hash,
      displayName: 'Alex Mercer',
      bio: 'Building habits. 1% daily.',
      currentStreak: 14,
      longestStreak: 14,
      focusAreas: ['fitness', 'coding'],
    }
  });

  // Create more users and sample posts...
  console.log('Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
