-- CreateTable
CREATE TABLE "PostLikeEvent" (
    "id" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "clientToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLikeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostLikeEvent_postSlug_clientToken_key" ON "PostLikeEvent"("postSlug", "clientToken");

-- CreateIndex
CREATE INDEX "PostLikeEvent_postSlug_idx" ON "PostLikeEvent"("postSlug");

-- CreateIndex
CREATE INDEX "PostLikeEvent_clientToken_idx" ON "PostLikeEvent"("clientToken");
