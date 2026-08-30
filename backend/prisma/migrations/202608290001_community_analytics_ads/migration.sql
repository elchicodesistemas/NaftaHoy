CREATE TABLE "FuelQualityVote" (
  "id" SERIAL NOT NULL,
  "visitorId" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FuelQualityVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FuelQualityVote_visitorId_key" ON "FuelQualityVote"("visitorId");
CREATE INDEX "FuelQualityVote_brand_idx" ON "FuelQualityVote"("brand");
CREATE INDEX "FuelQualityVote_createdAt_idx" ON "FuelQualityVote"("createdAt");

CREATE TABLE "StationRating" (
  "id" SERIAL NOT NULL,
  "stationId" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "fuelQuality" INTEGER NOT NULL,
  "service" INTEGER NOT NULL,
  "cleanliness" INTEGER NOT NULL,
  "speed" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StationRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StationRating_stationId_visitorId_key" ON "StationRating"("stationId", "visitorId");
CREATE INDEX "StationRating_stationId_createdAt_idx" ON "StationRating"("stationId", "createdAt");
ALTER TABLE "StationRating" ADD CONSTRAINT "StationRating_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Advertiser" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "contact" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Advertiser_active_idx" ON "Advertiser"("active");

CREATE TABLE "Campaign" (
  "id" TEXT NOT NULL, "advertiserId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3), "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Campaign_advertiserId_idx" ON "Campaign"("advertiserId");
CREATE INDEX "Campaign_active_startsAt_endsAt_idx" ON "Campaign"("active", "startsAt", "endsAt");
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Ad" (
  "id" TEXT NOT NULL, "campaignId" TEXT NOT NULL, "name" TEXT NOT NULL, "imageUrl" TEXT,
  "destinationUrl" TEXT NOT NULL, "placement" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Ad_campaignId_idx" ON "Ad"("campaignId");
CREATE INDEX "Ad_placement_active_idx" ON "Ad"("placement", "active");
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AdImpression" (
  "id" SERIAL NOT NULL, "adId" TEXT NOT NULL, "pagePath" TEXT NOT NULL, "placement" TEXT NOT NULL,
  "visitorId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdImpression_adId_createdAt_idx" ON "AdImpression"("adId", "createdAt");
CREATE INDEX "AdImpression_placement_createdAt_idx" ON "AdImpression"("placement", "createdAt");
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AdClick" (
  "id" SERIAL NOT NULL, "adId" TEXT NOT NULL, "pagePath" TEXT NOT NULL, "placement" TEXT NOT NULL,
  "visitorId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdClick_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdClick_adId_createdAt_idx" ON "AdClick"("adId", "createdAt");
CREATE INDEX "AdClick_placement_createdAt_idx" ON "AdClick"("placement", "createdAt");
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
