-- 1) Create all new enum types
CREATE TYPE "ListingStatus" AS ENUM('DRAFT','ACTIVE','ARCHIVED','SOLD');
CREATE TYPE "DeliveryMethod" AS ENUM('PICKUP','SHIP');
CREATE TYPE "ModelStatus"   AS ENUM('PENDING','RENDERING','COMPLETED','ERROR');
CREATE TYPE "TransactionStatus" AS ENUM('PENDING','COMPLETED','FAILED','REFUNDED');

-- 2) Handle listing_models.status → model_status
ALTER TABLE "listing_models" RENAME COLUMN "status" TO "old_status";
ALTER TABLE "listing_models"
  ADD COLUMN "model_status" "ModelStatus" NOT NULL DEFAULT CAST('PENDING' AS "ModelStatus");
UPDATE "listing_models" SET "model_status" =
  CASE old_status
    WHEN 'PENDING'   THEN 'PENDING'
    WHEN 'RENDERING' THEN 'RENDERING'
    WHEN 'COMPLETED' THEN 'COMPLETED'
    WHEN 'ERROR'     THEN 'ERROR'
    ELSE 'PENDING'
  END;
ALTER TABLE "listing_models" DROP COLUMN "old_status";

-- 3) Handle transactions.status → transaction_status
ALTER TABLE "transactions" RENAME COLUMN "status" TO "old_status";
ALTER TABLE "transactions"
  ADD COLUMN "transaction_status" "TransactionStatus" NOT NULL DEFAULT CAST('PENDING' AS "TransactionStatus");
UPDATE "transactions" SET "transaction_status" =
  CASE old_status
    WHEN 'PENDING'   THEN 'PENDING'
    WHEN 'COMPLETED' THEN 'COMPLETED'
    WHEN 'FAILED'    THEN 'FAILED'
    WHEN 'REFUNDED'  THEN 'REFUNDED'
    ELSE 'PENDING'
  END;
ALTER TABLE "transactions" DROP COLUMN "old_status";

-- 4) Add new Listing columns and preserve existing listings.status
ALTER TABLE "listings"
  ADD COLUMN "delivery_method" "DeliveryMethod" NOT NULL DEFAULT CAST('PICKUP' AS "DeliveryMethod"),
  ADD COLUMN "is_available"    BOOLEAN         NOT NULL DEFAULT TRUE,
  ADD COLUMN "updated_at"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Convert free‐form listings.status → enum type in-place
ALTER TABLE "listings"
  ALTER COLUMN "status" TYPE "ListingStatus"
    USING (
      CASE status
        WHEN 'draft'    THEN 'DRAFT'
        WHEN 'ACTIVE'   THEN 'ACTIVE'
        WHEN 'ARCHIVED' THEN 'ARCHIVED'
        WHEN 'SOLD'     THEN 'SOLD'
        ELSE 'DRAFT'
      END
    ),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- 5) Re-create indexes
CREATE INDEX "listings_status_idx"            ON "listings"("status");
CREATE INDEX "listings_user_id_created_at_idx" ON "listings"("user_id","created_at");