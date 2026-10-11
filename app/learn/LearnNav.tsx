"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Academy", "/learn"],
  ["HLD", "/learn/hld"],
  ["LLD", "/learn/lld"],
  ["Public APIs", "/learn/public-apis"],
  ["Diagrams", "/learn/diagrams"],
  ["Data", "/learn/ddia"],
  ["GenAI", "/learn/genai"],
] as const;

export function LearnNav() {
  const pathname = usePathname();

  return (
    <nav className="learn-nav shell">
      <Link className="brand" href="/">
        <span className="brand-mark">S</span>
        <span>
          ship<span className="dot">.</span>it<span className="dot">.</span>today
        </span>
      </Link>
      <div>
        {links.map(([label, href]) => {
          const active = href === "/learn" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <Link className="back-home" href="/">
        ← World map
      </Link>
    </nav>
  );
}
