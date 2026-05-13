-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_mapId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
