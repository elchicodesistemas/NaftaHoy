import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdBanner from "@/components/AdBanner";
import PriceBoard from "@/components/PriceBoard";
import TrendSection from "@/components/TrendSection";
import StationMap from "@/components/StationMap";
import NewsGrid from "@/components/NewsGrid";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";

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
