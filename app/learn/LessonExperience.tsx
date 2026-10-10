"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lesson } from "./academy-data";
import { JointArchitecture } from "./JointArchitecture";
import { LearnNav } from "./LearnNav";

const routeFor = (track: Lesson["track"], slug: string) =>
  `/learn/${track === "API" ? "apis" : track === "DIAGRAM" ? "diagrams" : track.toLowerCase()}/${slug}`;

function ArchitectureDiagram({ lesson }: { lesson: Lesson }) {
  return <JointArchitecture nodes={lesson.nodes} kind={lesson.diagram} />;
}

export function LessonExperience({ lesson, siblings }: { lesson: Lesson; siblings: Lesson[] }) {
  const [chapter, setChapter] = useState(0);
  const active = lesson.steps[chapter];
  const currentIndex = siblings.findIndex(item => item.slug === lesson.slug);
  const previous = siblings[currentIndex - 1];
  const next = siblings[currentIndex + 1];
  const progress = ((chapter + 1) / lesson.steps.length) * 100;

  return <main className="course-page academy-lesson">
    <LearnNav />
    <header className="academy-lesson-hero shell">
      <div className="academy-breadcrumb"><Link href="/learn">ACADEMY</Link><span>/</span><Link href={`/learn/${lesson.track === "API" ? "apis" : lesson.track === "DIAGRAM" ? "diagrams" : lesson.track.toLowerCase()}`}>{lesson.track}</Link><span>/</span><b>{lesson.index}</b></div>
      <div className="lesson-title-row"><div><span className="course-index">{lesson.track} / {lesson.index}</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div><aside><span>{lesson.difficulty}</span><span>{lesson.duration}</span><span>{lesson.steps.length} chapters</span></aside></div>
    </header>

    <section className="lesson-player shell">
      <div className="player-topbar"><div><i /><b>JOINTJS ARCHITECTURE DIAGRAM</b></div><span>{lesson.nodes.length} COMPONENTS · ALWAYS VISIBLE</span></div>
      <ArchitectureDiagram lesson={lesson} />
    </section>

    <section className="lesson-body shell">
      <aside className="chapter-nav"><span>CHAPTERS</span>{lesson.steps.map((step, index) => <button className={chapter === index ? "active" : ""} onClick={() => setChapter(index)} key={step.title}><i>{String(index + 1).padStart(2, "0")}</i><b>{step.title}</b><small>{index < chapter ? "COMPLETE" : index === chapter ? "NOW LEARNING" : "UP NEXT"}</small></button>)}</aside>
      <article className="chapter-content" key={active.title}>
        <small>CHAPTER {chapter + 1} OF {lesson.steps.length}</small>
        <h2>{active.title}</h2>
        <p>{active.summary}</p>
        <div className="chapter-points">{active.points.map((point, index) => <div key={point}><span>{String(index + 1).padStart(2, "0")}</span><p>{point}</p></div>)}</div>
        {active.code && <div className="academy-code"><header><span>PRODUCTION EXAMPLE</span><b>TypeScript / HTTP</b></header><pre>{active.code}</pre></div>}
        <button className="chapter-next" onClick={() => setChapter(value => Math.min(lesson.steps.length - 1, value + 1))} disabled={chapter === lesson.steps.length - 1}>Continue to chapter {Math.min(chapter + 2, lesson.steps.length)} <span>→</span></button>
      </article>
      <aside className="lesson-notes"><span>DESIGN REVIEW</span><h3>Ask these questions</h3><ul><li>What fails first?</li><li>Where is the source of truth?</li><li>Which guarantee is required?</li><li>How will we measure it?</li><li>How do we roll it back?</li></ul><div><small>LESSON PROGRESS</small><b>{Math.round(progress)}%</b><i><u style={{ width: `${progress}%` }} /></i></div></aside>
    </section>

    <nav className="lesson-pagination shell">
      {previous ? <Link href={routeFor(previous.track, previous.slug)}><small>← PREVIOUS</small><b>{previous.title}</b></Link> : <span />}
      {next ? <Link href={routeFor(next.track, next.slug)}><small>NEXT →</small><b>{next.title}</b></Link> : <Link href="/learn"><small>COMPLETE TRACK →</small><b>Academy home</b></Link>}
    </nav>
  </main>;
}
