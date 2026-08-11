import { createFileRoute } from "@tanstack/react-router";
import { MobileStickyCta, Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Statement } from "@/components/sections/Statement";
import { WhoAreYou } from "@/components/sections/WhoAreYou";
import { Eligibility } from "@/components/sections/Eligibility";
import { AiMatching } from "@/components/sections/AiMatching";
import { Results } from "@/components/sections/Results";
import { Benefits } from "@/components/sections/Benefits";
import { WhyQualify } from "@/components/sections/WhyQualify";
import { Journey } from "@/components/sections/Journey";
import { Assistant } from "@/components/sections/Assistant";
import { IndiaSection } from "@/components/sections/IndiaSection";
import { Stories } from "@/components/sections/Stories";
import { Categories } from "@/components/sections/Categories";
import { Trust } from "@/components/sections/Trust";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yojantra — Discover the benefits meant for you" },
      {
        name: "description",
        content:
          "India has thousands of government schemes. Yojantra helps you find the ones you can actually benefit from — with eligibility, benefits and official links.",
      },
      { property: "og:title", content: "Yojantra — Discover the benefits meant for you" },
      {
        property: "og:description",
        content: "Find Indian government schemes you qualify for, understand why you match, and apply officially.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="overflow-x-hidden bg-ivory text-ink">
      <Nav />
      <Hero />
      <Statement />
      <WhoAreYou />
      <Eligibility />
      <AiMatching />
      <Results />
      <Benefits />
      <WhyQualify />
      <Journey />
      <Assistant />
      <IndiaSection />
      <Stories />
      <Categories />
      <Trust />
      <Footer />
      <MobileStickyCta />
    </main>
  );
}
