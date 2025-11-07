// backend/lib/prisma.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// ✅ Create and export a single Prisma instance
const prisma = new PrismaClient();
export { prisma };

// ✅ Graceful shutdown on Ctrl+C or nodemon restart
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
