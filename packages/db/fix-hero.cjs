const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();
(async () => {
  const updated = await prisma.homeHero.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      tagline1: "MIND UP",
      tagline2: "Change your MIND",
      tagline3: "Change your life",
    },
    update: {
      tagline1: "MIND UP",
      tagline2: "Change your MIND",
      tagline3: "Change your life",
    },
  });
  console.log("Updated:", JSON.stringify(updated, null, 2));
  await prisma.$disconnect();
})();
