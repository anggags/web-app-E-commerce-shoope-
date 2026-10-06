import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.argv[2];
  const isBanned = process.argv[3] === "ban";

  if (!email) {
    console.log("usage: tsx scripts/toggle-ban.ts <email> ban|unban");
    return;
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isBanned },
    select: { email: true, isBanned: true },
  });

  console.log(`${user.email} isBanned=${user.isBanned}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());