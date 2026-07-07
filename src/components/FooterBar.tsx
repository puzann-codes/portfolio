"use client";

import Link from "next/link";
import Magnetic from "./Magnetic";

const indexLinks = [
  { n: "01", label: "Work", href: "/" },
  { n: "02", label: "About", href: "/about" },
  { n: "03", label: "Contact", href: "/contact" },
];

const socials = [
  { n: "04", label: "GitHub", href: "https://github.com" },
  { n: "05", label: "LinkedIn", href: "https://linkedin.com" },
  { n: "06", label: "X / Twitter", href: "https://twitter.com" },
];

export default function FooterBar() {
  return (
    <footer className="relative z-[100] mix-blend-difference">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.15em] text-paper md:px-10 md:py-8">
        <div className="leading-relaxed">
          <p>Studio of Pujan Bhatt</p>
          <p className="opacity-70">Full-Stack &amp; AI Engineer</p>
        </div>

        <div className="hidden leading-relaxed sm:block">
          <p>Kathmandu, Nepal</p>
          <Magnetic strength={0.25}>
            <a
              href="mailto:hello@pujanbhatt.dev"
              data-cursor="hover"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              hello@pujanbhatt.dev
            </a>
          </Magnetic>
        </div>

        <div className="hidden flex-col gap-1 md:flex">
          {indexLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="hover"
              className="transition-opacity hover:opacity-70"
            >
              {item.n}&nbsp;&nbsp;{item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {socials.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="transition-opacity hover:opacity-70"
            >
              {item.n}&nbsp;&nbsp;{item.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block opacity-70">
          <p>Design &amp; Code</p>
          <p>Pujan Bhatt</p>
        </div>
      </div>
    </footer>
  );
}
