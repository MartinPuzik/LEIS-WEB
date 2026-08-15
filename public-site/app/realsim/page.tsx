import type { Metadata } from "next";
import RealSimWorkbench from "./RealSimWorkbench";

export const metadata: Metadata = {
  title: "4D realSIM Earth | LEIS Local Workbench",
  description: "Local visual workbench for the bounded LEIS 4D realSIM Earth sandbox.",
  robots: { index: false, follow: false },
};

export default function RealSimPage() {
  return <RealSimWorkbench />;
}
