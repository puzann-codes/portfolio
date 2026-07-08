import type { Metadata } from "next";
import { Unbounded, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ConditionalFooter from "@/components/ConditionalFooter";
import GrainOverlay from "@/components/GrainOverlay";
import Cursor from "@/components/Cursor";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import TransitionProvider, { PageFade } from "@/components/TransitionProvider";
import { NavVisibilityProvider } from "@/components/NavVisibilityProvider";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pujan Bhatt — AI Engineer & Full-Stack Developer",
  description:
    "Portfolio of Pujan Bhatt, an AI engineer and full-stack developer building supply chain, civic-tech, health and collaborative developer tools.",
  openGraph: {
    title: "Pujan Bhatt — AI Engineer & Full-Stack Developer",
    description:
      "Portfolio of Pujan Bhatt, an AI engineer and full-stack developer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SmoothScrollProvider>
          <TransitionProvider>
            <NavVisibilityProvider>
              <GrainOverlay />
              <Cursor />
              <NavBar />
              <div className="flex-1">
                <PageFade>{children}</PageFade>
              </div>
              <ConditionalFooter />
            </NavVisibilityProvider>
          </TransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
