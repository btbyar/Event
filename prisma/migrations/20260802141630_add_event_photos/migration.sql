-- CreateTable
CREATE TABLE "EventPhoto" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "faceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoFace" (
    "id" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "box" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoId" TEXT NOT NULL,

    CONSTRAINT "PhotoFace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPhoto_eventId_idx" ON "EventPhoto"("eventId");

-- CreateIndex
CREATE INDEX "EventPhoto_eventId_processedAt_idx" ON "EventPhoto"("eventId", "processedAt");

-- CreateIndex
CREATE INDEX "PhotoFace_photoId_idx" ON "PhotoFace"("photoId");

-- AddForeignKey
ALTER TABLE "EventPhoto" ADD CONSTRAINT "EventPhoto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoFace" ADD CONSTRAINT "PhotoFace_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "EventPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
