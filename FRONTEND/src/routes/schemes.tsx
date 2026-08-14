import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PublicSchemes } from "@/components/sections/PublicSchemes";

export const Route = createFileRoute("/schemes")({
  head: () => ({ title: "Explore Current Government Schemes – Yojantra", description: "Search and explore current Indian government schemes from verified public records." }),
  component: Schemes,
});

function Schemes() {
  return <main className="bg-ivory text-ink"><Nav /><PublicSchemes /><Footer /></main>;
}
