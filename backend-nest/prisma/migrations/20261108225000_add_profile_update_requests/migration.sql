CREATE TABLE "ProfileUpdateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedChanges" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProfileUpdateRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProfileUpdateRequest_status_createdAt_idx" ON "ProfileUpdateRequest"("status", "createdAt");
CREATE INDEX "ProfileUpdateRequest_userId_status_idx" ON "ProfileUpdateRequest"("userId", "status");

ALTER TABLE "ProfileUpdateRequest"
ADD CONSTRAINT "ProfileUpdateRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
