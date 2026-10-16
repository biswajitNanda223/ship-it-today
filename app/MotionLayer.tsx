"use client";
import { animate, inView, stagger } from "motion";
import { useEffect, useRef } from "react";

export function MotionLayer() {
  const raf = useRef(0);
  useEffect(() => {
    const targets = [
      ...document.querySelectorAll<HTMLElement>(
        "main section, main > header, .course-hero, .public-api-hero, .hld-canvas, .pattern-workbench, .request-studio, .ddia-studio",
      ),
    ];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealed = new WeakSet<Element>();
    const stopInView = targets.map((element) => {
      if (reducedMotion) return () => undefined;
      return inView(
        element,
        () => {
          if (revealed.has(element)) return;
          revealed.add(element);
          const cards = element.querySelectorAll<HTMLElement>(
            ".lesson-card, .track-card, .track, .academy-track-grid > a, .deep-dives a, .api-catalog button, .ai-layer-inspector button, .ai-checklist article, .pattern-menu button, .chapter-points > div, .lesson-outcome, .ood-panel, .road",
          );
          if (cards.length) {
            animate(
              [...cards].slice(0, 8),
              {
                opacity: [0.84, 1],
                transform: [
                  "translateY(12px)",
                  "translateY(0px)",
                ],
              },
              { duration: 0.38, delay: stagger(0.025), ease: [0.22, 1, 0.36, 1] },
            );
          }
        },
        { margin: "0px 0px -7% 0px", amount: 0.08 },
      );
    });

    if (!reducedMotion) {
      animate(
        ".nav > *, .learn-nav > *",
        { opacity: [0, 1], transform: ["translateY(-12px)", "translateY(0px)"] },
        { duration: 0.5, delay: stagger(0.055), ease: [0.22, 1, 0.36, 1] },
      );
    }
    const paintScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        `${max ? Math.min(1, Math.max(0, scrollY / max)) : 0}`,
      );
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(paintScroll);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || reducedMotion) return;
      const card =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              ".lesson-card, .academy-track-grid > a, .deep-dives a, .track-card, .track, .ood-panel, .api-catalog button",
            )
          : null;
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--card-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--card-y", `${event.clientY - bounds.top}px`);
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      stopInView.forEach((stop) => stop());
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="ambient-beam" aria-hidden="true" />
      <div className="motion-spotlight" aria-hidden="true" />
      <div className="graffiti-atmosphere" aria-hidden="true">
        <i className="graffiti-slash slash-one" />
        <i className="graffiti-slash slash-two" />
        <span className="graffiti-tag tag-build">BUILD / BREAK / SCALE</span>
        <span className="graffiti-tag tag-ship">SHIP IT ↗</span>
      </div>
    </>
  );
}
