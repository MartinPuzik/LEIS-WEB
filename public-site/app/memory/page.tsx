import type { Metadata } from "next";
import MemoryMonitor from "./MemoryMonitor";

export const metadata: Metadata = {
  title: "LEIS Memory — živý stav čtení",
  description: "Veřejný monitor bezpečně ohraničeného čtení PDF a EPUB do LEIS Memory.",
  alternates: { canonical: "/memory" },
  openGraph: {
    title: "LEIS Memory — živý stav čtení",
    description: "Veřejný monitor bezpečně ohraničeného čtení PDF a EPUB do LEIS Memory.",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "LEIS Memory — živý stav čtení",
    description: "Veřejný monitor bezpečně ohraničeného čtení PDF a EPUB do LEIS Memory.",
    images: [],
  },
};

export default function MemoryPage() {
  return <MemoryMonitor />;
}
