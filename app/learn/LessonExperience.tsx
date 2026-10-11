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
  const [copied, setCopied] = useState(false);
  const active = lesson.steps[chapter];
  const currentIndex = siblings.findIndex((item) => item.slug === lesson.slug);
  const previous = siblings[currentIndex - 1];
  const next = siblings[currentIndex + 1];
  const progress = ((chapter + 1) / lesson.steps.length) * 100;
  const copyCode = async () => {
    if (!active.code || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="course-page academy-lesson">
      <LearnNav />
      <header className="academy-lesson-hero shell">
        <div className="academy-breadcrumb">
          <Link href="/learn">ACADEMY</Link>
          <span>/</span>
          <Link
            href={`/learn/${lesson.track === "API" ? "apis" : lesson.track === "DIAGRAM" ? "diagrams" : lesson.track.toLowerCase()}`}
          >
            {lesson.track}
          </Link>
          <span>/</span>
          <b>{lesson.index}</b>
        </div>
        <div className="lesson-title-row">
          <div>
            <span className="course-index">
              {lesson.track} / {lesson.index}
            </span>
            <h1>{lesson.title}</h1>
            <p>{lesson.subtitle}</p>
          </div>
          <aside>
            <span>{lesson.difficulty}</span>
            <span>{lesson.duration}</span>
            <span>{lesson.steps.length} chapters</span>
          </aside>
        </div>
      </header>

      <section className="lesson-outcomes shell" aria-label="Lesson outcomes">
        <article className="lesson-outcome">
          <span>MENTAL MODEL</span>
          <b>Follow one request end to end</b>
          <p>See where responsibility moves and where the design can fail.</p>
        </article>
        <article className="lesson-outcome">
          <span>YOU WILL DESIGN</span>
          <b>
            {lesson.nodes
              .slice(0, 3)
              .map((node) => node.name)
              .join(" → ")}
          </b>
          <p>{lesson.nodes.length} connected components with explicit boundaries.</p>
        </article>
        <article className="lesson-outcome">
          <span>REVIEW STANDARD</span>
          <b>Correctness before scale</b>
          <p>State the guarantee, bottleneck, signal, and rollback path.</p>
        </article>
      </section>

      <section className="lesson-player shell">
        <div className="player-topbar">
          <div>
            <i />
            <b>JOINTJS ARCHITECTURE DIAGRAM</b>
          </div>
          <span>{lesson.nodes.length} COMPONENTS · ALWAYS VISIBLE</span>
        </div>
        <ArchitectureDiagram lesson={lesson} />
      </section>

      <section className="lesson-body shell">
        <aside className="chapter-nav">
          <span>CHAPTERS</span>
          {lesson.steps.map((step, index) => (
            <button
              className={chapter === index ? "active" : ""}
              onClick={() => setChapter(index)}
              key={step.title}
              aria-current={chapter === index ? "step" : undefined}
            >
              <i>{String(index + 1).padStart(2, "0")}</i>
              <b>{step.title}</b>
              <small>
                {index < chapter ? "COMPLETE" : index === chapter ? "NOW LEARNING" : "UP NEXT"}
              </small>
            </button>
          ))}
        </aside>
        <article className="chapter-content" key={active.title}>
          <div className="chapter-progress-rail" aria-hidden="true">
            {lesson.steps.map((step, index) => (
              <i className={index <= chapter ? "complete" : ""} key={step.title} />
            ))}
          </div>
          <small>
            CHAPTER {chapter + 1} OF {lesson.steps.length}
          </small>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
          <div className="chapter-points">
            {active.points.map((point, index) => (
              <div key={point}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
          {active.code && (
            <div className="academy-code">
              <header>
                <span>PRODUCTION EXAMPLE</span>
                <button onClick={copyCode}>{copied ? "COPIED ✓" : "COPY CODE"}</button>
              </header>
              <pre>{active.code}</pre>
            </div>
          )}
          <div className="chapter-actions">
            <button
              className="chapter-previous"
              onClick={() => setChapter((value) => Math.max(0, value - 1))}
              disabled={chapter === 0}
            >
              <span>←</span> Previous
            </button>
            <button
              className="chapter-next"
              onClick={() => setChapter((value) => Math.min(lesson.steps.length - 1, value + 1))}
              disabled={chapter === lesson.steps.length - 1}
            >
              {chapter === lesson.steps.length - 1
                ? "Lesson complete"
                : `Continue to chapter ${chapter + 2}`}{" "}
              <span>→</span>
            </button>
          </div>
        </article>
        <aside className="lesson-notes">
          <span>DESIGN REVIEW</span>
          <h3>Ask these questions</h3>
          <ul>
            <li>What fails first?</li>
            <li>Where is the source of truth?</li>
            <li>Which guarantee is required?</li>
            <li>How will we measure it?</li>
            <li>How do we roll it back?</li>
          </ul>
          <div>
            <small>LESSON PROGRESS</small>
            <b>{Math.round(progress)}%</b>
            <i>
              <u style={{ width: `${progress}%` }} />
            </i>
          </div>
        </aside>
      </section>

      <nav className="lesson-pagination shell">
        {previous ? (
          <Link href={routeFor(previous.track, previous.slug)}>
            <small>← PREVIOUS</small>
            <b>{previous.title}</b>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={routeFor(next.track, next.slug)}>
            <small>NEXT →</small>
            <b>{next.title}</b>
          </Link>
        ) : (
          <Link href="/learn">
            <small>COMPLETE TRACK →</small>
            <b>Academy home</b>
          </Link>
        )}
      </nav>
    </main>
  );
}
