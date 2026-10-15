import Hero from "@/sections/home/Hero";
import TrustStrip from "@/sections/home/TrustStrip";
import CategoryTiles from "@/sections/home/CategoryTiles";
import NewArrivals from "@/sections/home/NewArrivals";
import FeaturedCollections from "@/sections/home/FeaturedCollections";
import BestSellers from "@/sections/home/BestSellers";
import Modern3DSection from "@/sections/home/Modern3DSection";
import OffersSection from "@/sections/home/OffersSection";
import OurStory from "@/sections/home/OurStory";
import Recommended from "@/sections/home/Recommended";
import RecentlyViewed from "@/sections/home/RecentlyViewed";
import Testimonials from "@/sections/home/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppFab from "@/components/WhatsAppFab";
import Newsletter from "@/sections/home/Newsletter";

/**
 * Home page (05-ui-context.md §7.2): the 13 content sections in the exact order from the spec.
 * The footer is provided by `RootLayout`, so it is not repeated here.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />
      <NewArrivals />
      <FeaturedCollections />
      <BestSellers />
      <Modern3DSection />
      <OffersSection />
      <OurStory />
      <Recommended />
      <RecentlyViewed />
      <Testimonials />
      <TrustBadges />
      <Newsletter />
      {/* Floating CTA (08-owner-ui-revisions.md §R3.b). */}
      <WhatsAppFab />
    </>
  );
}