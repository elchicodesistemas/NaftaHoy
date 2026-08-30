import { prisma } from "../config/prisma";

export const AD_PLACEMENTS = ["home-top", "home-middle", "station-detail", "sidebar"] as const;
export type AdPlacement = typeof AD_PLACEMENTS[number];

export class CommunityService {
  public async getFuelQualityPoll() {
    const stations = await prisma.station.findMany({ distinct: ["brand"], select: { brand: true, brandName: true }, orderBy: { brandName: "asc" } });
    const votes = await prisma.fuelQualityVote.groupBy({ by: ["brand"], _count: { _all: true } });
    const counts = new Map(votes.map((vote) => [vote.brand, vote._count._all]));
    const totalVotes = votes.reduce((sum, vote) => sum + vote._count._all, 0);
    return {
      totalVotes,
      options: stations.map((station) => {
        const count = counts.get(station.brand) || 0;
        return { brand: station.brand, name: station.brandName, votes: count, percentage: totalVotes ? Number(((count / totalVotes) * 100).toFixed(1)) : 0 };
      }),
    };
  }

  public async voteFuelQuality(brand: string, visitorId: string) {
    const station = await prisma.station.findFirst({ where: { brand }, select: { brand: true } });
    if (!station) throw new Error("BRAND_NOT_FOUND");
    try {
      await prisma.fuelQualityVote.create({ data: { brand, visitorId } });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("ALREADY_VOTED");
      throw error;
    }
    return this.getFuelQualityPoll();
  }

  public async getStationRatingSummary(stationId: string) {
    const aggregate = await prisma.stationRating.aggregate({ where: { stationId }, _avg: { fuelQuality: true, service: true, cleanliness: true, speed: true }, _count: { _all: true } });
    return { totalRatings: aggregate._count._all, averages: {
      fuelQuality: this.round(aggregate._avg.fuelQuality), service: this.round(aggregate._avg.service), cleanliness: this.round(aggregate._avg.cleanliness), speed: this.round(aggregate._avg.speed),
    } };
  }

  public async createStationRating(stationId: string, visitorId: string, values: { fuelQuality: number; service: number; cleanliness: number; speed: number }) {
    const station = await prisma.station.findUnique({ where: { id: stationId }, select: { id: true } });
    if (!station) throw new Error("STATION_NOT_FOUND");
    try {
      await prisma.stationRating.create({ data: { stationId, visitorId, ...values } });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("ALREADY_RATED");
      throw error;
    }
    return this.getStationRatingSummary(stationId);
  }

  public async getActiveAd(placement: AdPlacement) {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: { placement, active: true, campaign: { active: true, advertiser: { active: true }, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] } },
      select: { id: true, name: true, imageUrl: true, destinationUrl: true, placement: true, campaign: { select: { name: true, advertiser: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" }, take: 20,
    });
    const ad = ads.find((item) => this.isSafeHttpUrl(item.destinationUrl));
    return ad ? { ...ad, imageUrl: ad.imageUrl && this.isSafeHttpUrl(ad.imageUrl) ? ad.imageUrl : null } : null;
  }

  public async recordAdEvent(kind: "impression" | "click", adId: string, placement: AdPlacement, pagePath: string, visitorId?: string) {
    const ad = await this.getActiveAdById(adId, placement);
    if (!ad) throw new Error("AD_NOT_FOUND");
    const data = { adId, placement, pagePath, visitorId };
    return kind === "impression" ? prisma.adImpression.create({ data }) : prisma.adClick.create({ data });
  }

  public async getAdMetrics(input: { campaignId?: string; adId?: string }) {
    const campaign = input.campaignId
      ? await prisma.campaign.findUnique({ where: { id: input.campaignId }, select: { id: true, name: true } })
      : await prisma.ad.findUnique({ where: { id: input.adId }, select: { campaign: { select: { id: true, name: true } } } }).then((ad) => ad?.campaign || null);
    const adIds = input.adId ? [input.adId] : await prisma.ad.findMany({ where: { campaignId: input.campaignId }, select: { id: true } }).then((ads) => ads.map((ad) => ad.id));
    const [impressions, clicks] = await Promise.all([prisma.adImpression.count({ where: { adId: { in: adIds } } }), prisma.adClick.count({ where: { adId: { in: adIds } } })]);
    return { campaign: campaign?.name || null, campaignId: campaign?.id || input.campaignId || null, adId: input.adId || null, impressions, clicks, ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0 };
  }

  private async getActiveAdById(id: string, placement: AdPlacement) {
    const now = new Date();
    const ad = await prisma.ad.findFirst({ where: { id, placement, active: true, campaign: { active: true, advertiser: { active: true }, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] } }, select: { id: true, destinationUrl: true } });
    return ad && this.isSafeHttpUrl(ad.destinationUrl) ? ad : null;
  }
  private isSafeHttpUrl(value: string) { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
  private round(value: number | null) { return value === null ? 0 : Number(value.toFixed(2)); }
}

export const communityService = new CommunityService();
