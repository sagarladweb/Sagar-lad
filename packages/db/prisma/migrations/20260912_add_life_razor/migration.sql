-- CreateTable
CREATE TABLE "LifeRazor" (
    "id" TEXT NOT NULL,
    "pill" TEXT NOT NULL DEFAULT 'Current Life Razor',
    "heading" TEXT NOT NULL DEFAULT 'Be Dumb.',
    "accent" TEXT NOT NULL DEFAULT 'Don''t worry about what others think.',
    "description" TEXT NOT NULL DEFAULT 'A razor is a rule you cut your life with. Mine is a reminder to stay curious, keep asking the "dumb" questions, and never let the noise of other people''s opinions decide my next step.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeRazor_pkey" PRIMARY KEY ("id")
);
