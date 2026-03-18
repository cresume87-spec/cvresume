-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "invoiceNumber" TEXT,
ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");
