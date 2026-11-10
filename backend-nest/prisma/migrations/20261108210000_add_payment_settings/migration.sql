CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL,
    "purposes" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
