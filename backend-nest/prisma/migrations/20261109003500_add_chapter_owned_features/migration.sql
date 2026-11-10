ALTER TABLE "ReunionRegistration" ADD COLUMN "stateBaseCode" TEXT NOT NULL DEFAULT 'NAT';
CREATE INDEX "ReunionRegistration_stateBaseCode_createdAt_idx" ON "ReunionRegistration"("stateBaseCode", "createdAt");

ALTER TABLE "Payment" ADD COLUMN "stateBaseCode" TEXT NOT NULL DEFAULT 'NAT';
CREATE INDEX "Payment_stateBaseCode_createdAt_idx" ON "Payment"("stateBaseCode", "createdAt");

ALTER TABLE "SupportTicket" ADD COLUMN "stateBaseCode" TEXT NOT NULL DEFAULT 'NAT';
UPDATE "SupportTicket" AS ticket
SET "stateBaseCode" = COALESCE(users."stateBaseCode", 'NAT')
FROM "User" AS users
WHERE users."id" = ticket."userId";
CREATE INDEX "SupportTicket_stateBaseCode_status_createdAt_idx" ON "SupportTicket"("stateBaseCode", "status", "createdAt");

ALTER TABLE "GalleryImage" ADD COLUMN "stateBaseCode" TEXT NOT NULL DEFAULT 'NAT';
ALTER TABLE "ContactMessage" ADD COLUMN "stateBaseCode" TEXT NOT NULL DEFAULT 'NAT';

UPDATE "PaymentSettings" SET "id" = 'NAT' WHERE "id" = 'default';

CREATE TABLE "ReunionSettings" (
    "id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReunionSettings_pkey" PRIMARY KEY ("id")
);
