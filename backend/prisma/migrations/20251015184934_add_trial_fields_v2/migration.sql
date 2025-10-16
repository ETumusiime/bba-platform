-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'trial',
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3);
