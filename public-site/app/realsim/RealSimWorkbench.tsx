"use client";

import dynamic from "next/dynamic";

// Three.js owns this canvas after mount. Keeping the renderer client-only
// prevents a development hot reload from hydrating a stale WebGL workbench.
const RealSimEarth = dynamic(() => import("./RealSimEarth"), {
  ssr: false,
  loading: () => <main aria-busy="true" aria-label="4D realSIM Earth se spouští" />,
});

export default function RealSimWorkbench() {
  return <main><RealSimEarth /></main>;
}
