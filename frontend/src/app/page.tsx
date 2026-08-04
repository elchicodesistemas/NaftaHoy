import AdBanner from "@/components/AdBanner";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import NewsGrid from "@/components/NewsGrid";
import PriceBoard from "@/components/PriceBoard";
import StationMap from "@/components/StationMap";
import Ticker from "@/components/Ticker";
import TrendSection from "@/components/TrendSection";

export default function Home() {
  return (
    <>
      <Ticker />
      <Navbar />
      <Hero />

      <div className="max-w-content mx-auto px-6 mt-7">
        <AdBanner position="horizontal" />
      </div>

      <PriceBoard />

      <div className="max-w-content mx-auto px-6 mt-9">
        <AdBanner position="horizontal" />
      </div>

      <TrendSection />

      <div className="max-w-content mx-auto px-6 mt-7">
        <AdBanner position="horizontal" />
      </div>

      <StationMap />

      <div className="max-w-content mx-auto px-6 mt-9">
        <AdBanner position="horizontal" />
      </div>

      <NewsGrid />
      <CommunityReports />
      <Footer />
    </>
  );
}
