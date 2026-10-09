import Link from "next/link";
import type { ReactNode } from "react";
import type { Lesson } from "./academy-data";
import { LearnNav } from "./LearnNav";

const routeFor = (lesson: Lesson) => `/learn/${lesson.track === "API" ? "apis" : lesson.track === "DIAGRAM" ? "diagrams" : lesson.track.toLowerCase()}/${lesson.slug}`;

export function TrackHub({ eyebrow, title, accent, description, lessons, extra }: { eyebrow: string; title: string; accent: string; description: string; lessons: Lesson[]; extra?: ReactNode }) {
  return <main className="course-page track-hub"><LearnNav /><header className="track-hub-hero shell"><span className="course-index">{eyebrow}</span><h1>{title}<br/><em>{accent}</em></h1><p>{description}</p><div><b>{lessons.length}<span>DEEP-DIVE PAGES</span></b><b>{lessons.reduce((sum, item) => sum + item.steps.length, 0)}<span>CHAPTERS</span></b><b>{lessons.length}<span>ANIMATED DIAGRAMS</span></b></div></header><section className="lesson-grid shell">{lessons.map((item, index) => <Link href={routeFor(item)} key={item.slug} className="lesson-card"><header><span>{item.track} / {item.index}</span><i>{item.difficulty}</i></header><div className={`lesson-card-visual kind-${item.diagram}`}>{item.nodes.slice(0, 4).map((node, nodeIndex) => <b key={node.name} style={{ animationDelay: `${nodeIndex * 140}ms` }}>{node.name}<i>{nodeIndex < Math.min(3, item.nodes.length - 1) ? "→" : ""}</i></b>)}</div><article><small>{item.duration} · {item.steps.length} chapters</small><h2>{item.title}</h2><p>{item.description}</p><span>Open lesson <i>→</i></span></article><footer><i style={{ width: `${24 + index * 9}%` }} /></footer></Link>)}</section>{extra}</main>;
}
