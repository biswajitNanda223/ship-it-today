import Link from "next/link";

export function LearnNav() {
  return <nav className="learn-nav shell"><Link className="brand" href="/"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></Link><div><Link href="/learn">Academy</Link><Link href="/learn/hld">HLD</Link><Link href="/learn/lld">LLD</Link><Link href="/learn/diagrams">Diagrams</Link><Link href="/learn/apis">REST APIs</Link><Link href="/learn/genai">GenAI</Link></div><Link className="back-home" href="/">← World map</Link></nav>;
}
