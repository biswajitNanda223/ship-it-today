import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ship It Today — Learn System Design by Building",
  description: "An interactive engineering world for mastering HLD, LLD, APIs, databases, Docker, Kubernetes, Kafka, queues, and cloud architecture.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Ship It Today — Learn System Design by Building",
    description: "Design it. Scale it. Ship it today.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Ship It Today distributed systems learning world" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
