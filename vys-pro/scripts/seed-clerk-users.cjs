// scripts/seed-clerk-users.cjs
require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const { createClerkClient } = require('@clerk/backend');

async function main() {
  const prisma = new PrismaClient();
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  let offset = 0, totalCount;

  do {
    const { data: users, totalCount: count } = await clerk.users.getUserList({
      limit: 100,
      offset,
    });
    totalCount = count;

    for (const u of users) {
      await prisma.user.upsert({
        where: { clerk_id: u.id },
        create: { clerk_id: u.id, email: u.emailAddresses[0]?.emailAddress || '' },
        update: { email: u.emailAddresses[0]?.emailAddress || '' },
      });
    }
    offset += users.length;
  } while (offset < totalCount);

  console.log('✅ Backfilled all Clerk users');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
