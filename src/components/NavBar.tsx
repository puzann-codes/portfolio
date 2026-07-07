"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Magnetic from "./Magnetic";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Magnetic strength={0.3}>
      <Link
        href={href}
        data-cursor="hover"
        className="group relative font-mono text-xs uppercase tracking-[0.2em] text-current"
      >
        {label}
        <span
          className={cn(
            "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100",
            active && "scale-x-100",
          )}
        />
      </Link>
    </Magnetic>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      <nav
        className={cn(
          "flex items-center justify-end gap-6 px-6 py-6 md:gap-10 md:px-10 md:py-8",
          isHome ? "text-paper" : "text-ink",
        )}
      >
        {links.map((l) => (
          <NavLink key={l.href} {...l} />
        ))}
      </nav>
    </header>
  );
}
