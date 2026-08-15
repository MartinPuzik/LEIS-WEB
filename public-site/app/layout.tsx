import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LEIS — Understanding that can travel",
  description: "A reality-oriented framework for recognition, lineage and reconstructable understanding.",
  metadataBase: new URL("https://leis-understanding-system.puzik.chatgpt.site"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      cs: "/?lang=cs",
      de: "/?lang=de",
      fr: "/?lang=fr",
      es: "/?lang=es",
      "x-default": "/",
    },
  },
  applicationName: "LEIS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LEIS",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "LEIS — Understanding that can travel",
    description: "A reality-oriented framework for recognition, lineage and reconstructable understanding.",
    type: "website",
    images: [
      {
        url: "/og-leis-v2.png",
        width: 1730,
        height: 910,
        alt: "LEIS — a luminous Omega within a calm network of connected understanding.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEIS — Understanding that can travel",
    description: "A reality-oriented framework for recognition, lineage and reconstructable understanding.",
    images: ["/og-leis-v2.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

const leisStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LEIS",
  alternateName: "Reality-Oriented Understanding System",
  url: "https://leis-understanding-system.puzik.chatgpt.site/",
  description:
    "A reality-oriented framework for recognition, lineage and reconstructable understanding.",
  creator: {
    "@type": "Person",
    name: "Martin Pužík",
    jobTitle: "Creator and constitution author of LEIS",
    sameAs: ["https://github.com/MartinPuzik"],
  },
  contributor: {
    "@type": "Person",
    name: "M.A.J. Pužík",
    description: "Technical collaboration and practical development.",
  },
  inLanguage: ["en", "cs", "de", "fr", "es"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(leisStructuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
