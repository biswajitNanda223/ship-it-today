import Link from "next/link";

export function LearnNav() {
  return <nav className="learn-nav shell"><Link className="brand" href="/"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></Link><div><Link href="/learn/patterns">25 Patterns</Link><Link href="/learn/hld">HLD</Link><Link href="/learn/apis">API Lab</Link><Link href="/learn/genai">GenAI</Link><Link href="/learn/ddia">DDIA</Link></div><Link className="back-home" href="/">← World map</Link></nav>;
}
