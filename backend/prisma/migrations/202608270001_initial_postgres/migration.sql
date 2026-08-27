CREATE TABLE "Station" (
  "id" TEXT NOT NULL, "govId" INTEGER, "cuit" TEXT, "name" TEXT NOT NULL,
  "address" TEXT NOT NULL, "city" TEXT NOT NULL, "province" TEXT NOT NULL,
  "region" TEXT, "brand" TEXT NOT NULL, "brandName" TEXT NOT NULL, "brandId" INTEGER,
  "lat" DOUBLE PRECISION, "lng" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PriceRecord" (
  "id" SERIAL NOT NULL, "stationId" TEXT NOT NULL, "fuelType" TEXT NOT NULL,
  "fuelTypeName" TEXT NOT NULL, "originalProduct" TEXT NOT NULL, "timeSlot" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL, "prevPrice" DOUBLE PRECISION,
  "effectiveDate" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PriceRecord_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SyncLog" (
  "id" SERIAL NOT NULL, "source" TEXT NOT NULL, "status" TEXT NOT NULL,
  "recordsProcessed" INTEGER NOT NULL DEFAULT 0, "stationsCount" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3), CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CommunityReport" (
  "id" SERIAL NOT NULL, "userName" TEXT NOT NULL, "province" TEXT NOT NULL,
  "city" TEXT NOT NULL, "stationName" TEXT NOT NULL, "brand" TEXT NOT NULL,
  "fuelType" TEXT NOT NULL, "price" DOUBLE PRECISION NOT NULL, "likes" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Station_govId_key" ON "Station"("govId");
CREATE INDEX "Station_province_idx" ON "Station"("province");
CREATE INDEX "Station_brand_idx" ON "Station"("brand");
CREATE INDEX "Station_lat_lng_idx" ON "Station"("lat", "lng");
CREATE UNIQUE INDEX "PriceRecord_stationId_fuelType_timeSlot_effectiveDate_key" ON "PriceRecord"("stationId", "fuelType", "timeSlot", "effectiveDate");
CREATE INDEX "PriceRecord_stationId_fuelType_timeSlot_effectiveDate_idx" ON "PriceRecord"("stationId", "fuelType", "timeSlot", "effectiveDate");
CREATE INDEX "PriceRecord_fuelType_idx" ON "PriceRecord"("fuelType");
CREATE INDEX "PriceRecord_price_idx" ON "PriceRecord"("price");
CREATE INDEX "CommunityReport_createdAt_idx" ON "CommunityReport"("createdAt");
CREATE INDEX "CommunityReport_status_idx" ON "CommunityReport"("status");
ALTER TABLE "PriceRecord" ADD CONSTRAINT "PriceRecord_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
