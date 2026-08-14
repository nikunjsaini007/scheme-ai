import { createFileRoute } from "@tanstack/react-router";
import { MobileStickyCta, Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { PublicSchemes } from "@/components/sections/PublicSchemes";
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
      <PublicSchemes />
      <Trust />
      <Footer />
      <MobileStickyCta />
    </main>
  );
}
