import { motion, useAnimatePresence } from "motion/react";
import { useLocation } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-start";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export function PageShell() {
  const location = useLocation();

  return (
    <main className="overflow-x-hidden bg-ivory text-ink">
      <Nav />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen"
      >
        <Outlet />
      </motion.div>

      <Footer />
    </main>
  );
}
