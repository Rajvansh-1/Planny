require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  try {
    const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
    const users = await prisma.user.findMany();
    console.log('Connected to Prisma successfully');
    console.log('Users:', users);
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    process.exit(0);
  }
}

main();
