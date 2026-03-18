-- AddUserProfileSiteMetricPaymentCredit
ALTER TABLE "User"
    ADD COLUMN "phone" TEXT,
    ADD COLUMN "dateOfBirth" TIMESTAMP(3),
    ADD COLUMN "addressLine1" TEXT,
    ADD COLUMN "addressCity" TEXT,
    ADD COLUMN "addressCountryCode" TEXT,
    ADD COLUMN "addressPostalCode" TEXT;

ALTER TABLE "Order"
    ADD COLUMN "creditedAt" TIMESTAMP(3);

CREATE TABLE "SiteMetric" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMetric_pkey" PRIMARY KEY ("key")
);

INSERT INTO "SiteMetric" ("key", "value", "updatedAt")
VALUES ('resumes_created_count', 16356, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
