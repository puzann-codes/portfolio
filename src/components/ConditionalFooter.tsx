"use client";

import { usePathname } from "next/navigation";
import FooterBar from "./FooterBar";

// The detailed footer (email/location/index-nav/socials) only makes sense on
// pages with a paper background. The home hero has its own minimal
// bottom-left brand mark instead — see app/page.tsx.
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <FooterBar />;
}
