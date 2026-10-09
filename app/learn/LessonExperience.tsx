"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "./academy-data";
import { LearnNav } from "./LearnNav";

const routeFor = (track: Lesson["track"], slug: string) =>
  `/learn/${track === "API" ? "apis" : track === "DIAGRAM" ? "diagrams" : track.toLowerCase()}/${slug}`;

function ArchitectureDiagram({ lesson, frame }: { lesson: Lesson; frame: number }) {
  if (lesson.diagram === "sequence") {
    return <div className="academy-sequence" aria-label={`${lesson.title} sequence diagram`}>
      <div className="sequence-actors">{lesson.nodes.map((node, index) => <div className={frame === index ? "active" : ""} key={node.name}><b>{node.name}</b><small>{node.detail}</small><i /></div>)}</div>
      <div className="sequence-messages">{lesson.nodes.slice(0, -1).map((node, index) => <div className={frame >= index ? "sent" : ""} key={node.name} style={{ marginLeft: `${index * 13}%`, width: `${72 - index * 4}%` }}><span>{index % 2 ? "response" : "request"} {index + 1}</span><i>→</i></div>)}</div>
    </div>;
  }

  if (lesson.diagram === "class") {
    return <div className="academy-class" aria-label={`${lesson.title} class diagram`}>
      {lesson.nodes.map((node, index) => <div className={frame === index ? "active" : ""} key={node.name}><b>{node.name}</b><pre>{node.detail}</pre>{index < lesson.nodes.length - 1 && <i>{index % 2 ? "implements" : "uses"} →</i>}</div>)}
    </div>;
  }

  if (lesson.diagram === "data") {
    return <div className="academy-dataflow" aria-label={`${lesson.title} data flow diagram`}>
      <div className="dataflow-grid" />
      {lesson.nodes.map((node, index) => <div className={`df-node df-${index} ${frame === index ? "active" : ""}`} key={node.name}><small>{index % 3 === 0 ? "ENTITY" : index % 3 === 1 ? "PROCESS" : "DATA STORE"}</small><b>{node.name}</b><span>{node.detail}</span></div>)}
      <div className="dataflow-route"><i /><i /><i /></div>
    </div>;
  }

  return <div className={`academy-flow ${lesson.diagram}`} aria-label={`${lesson.title} ${lesson.diagram} diagram`}>
    {lesson.nodes.map((node, index) => <div className={frame === index ? "active" : ""} key={node.name}><span>{String(index + 1).padStart(2, "0")}</span><b>{node.name}</b><small>{node.detail}</small>{index < lesson.nodes.length - 1 && <i>→</i>}</div>)}
    <div className="flow-packet" style={{ "--frame": frame } as CSSProperties} />
  </div>;
}

export function LessonExperience({ lesson, siblings }: { lesson: Lesson; siblings: Lesson[] }) {
  const [chapter, setChapter] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = lesson.steps[chapter];
  const currentIndex = siblings.findIndex(item => item.slug === lesson.slug);
  const previous = siblings[currentIndex - 1];
  const next = siblings[currentIndex + 1];
  const progress = useMemo(() => ((chapter + 1) / lesson.steps.length) * 100, [chapter, lesson.steps.length]);

  useEffect(() => {
    if (!playing) return;
    if (frame >= lesson.nodes.length - 1) {
      const stop = window.setTimeout(() => setPlaying(false), 700);
      return () => window.clearTimeout(stop);
    }
    const timer = window.setTimeout(() => setFrame(value => value + 1), 800);
    return () => window.clearTimeout(timer);
  }, [frame, playing, lesson.nodes.length]);

  function play() {
    setFrame(0);
    setPlaying(true);
  }

  return <main className="course-page academy-lesson">
    <LearnNav />
    <header className="academy-lesson-hero shell">
      <div className="academy-breadcrumb"><Link href="/learn">ACADEMY</Link><span>/</span><Link href={`/learn/${lesson.track === "API" ? "apis" : lesson.track === "DIAGRAM" ? "diagrams" : lesson.track.toLowerCase()}`}>{lesson.track}</Link><span>/</span><b>{lesson.index}</b></div>
      <div className="lesson-title-row"><div><span className="course-index">{lesson.track} / {lesson.index}</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div><aside><span>{lesson.difficulty}</span><span>{lesson.duration}</span><span>{lesson.steps.length} chapters</span></aside></div>
    </header>

    <section className="lesson-player shell">
      <div className="player-topbar"><div><i /><b>ANIMATED ARCHITECTURE WALKTHROUGH</b></div><span>FRAME {frame + 1} / {lesson.nodes.length}</span></div>
      <ArchitectureDiagram lesson={lesson} frame={frame} />
      <div className="player-controls"><button onClick={playing ? () => setPlaying(false) : play} aria-label={playing ? "Pause diagram animation" : "Play diagram animation"}>{playing ? "Ⅱ" : "▶"}</button><div><i style={{ width: `${((frame + 1) / lesson.nodes.length) * 100}%` }} /></div><span>{playing ? "PLAYING" : frame === lesson.nodes.length - 1 ? "COMPLETE" : "READY"}</span><button onClick={() => { setFrame(0); setPlaying(false); }}>↺ RESTART</button></div>
      <footer><b>{lesson.nodes[frame].name}</b><span>{lesson.nodes[frame].detail}</span></footer>
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
