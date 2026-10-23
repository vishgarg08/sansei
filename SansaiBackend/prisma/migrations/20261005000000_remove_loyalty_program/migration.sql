-- Remove the retired loyalty program's transactions, points balance, and enum.
DROP TABLE "LoyaltyTransaction";

ALTER TABLE "CustomerProfile" DROP COLUMN "loyaltyPoints";

DROP TYPE "LoyaltyTransactionType";
