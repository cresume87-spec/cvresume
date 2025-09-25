-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "docType" TEXT NOT NULL DEFAULT 'document',
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Draft',
ALTER COLUMN "updatedAt" DROP DEFAULT;
