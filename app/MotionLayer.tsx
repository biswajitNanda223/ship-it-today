"use client";
import { animate, inView, stagger } from "motion";
import { useEffect, useRef } from "react";

export function MotionLayer() {
  const raf = useRef(0);
  const pointerRaf = useRef(0);
  useEffect(() => {
    const targets = [
      ...document.querySelectorAll<HTMLElement>(
        "main section, main > header, .course-hero, .public-api-hero, .hld-canvas, .pattern-workbench, .request-studio, .ddia-studio",
      ),
    ];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopInView = targets.map((element, sectionIndex) => {
      if (reducedMotion) return () => undefined;
      return inView(
        element,
        () => {
          animate(
            element,
            {
              opacity: [0.7, 1],
              transform: [
                `translateY(34px) rotate(${sectionIndex % 2 ? "-0.35deg" : "0.35deg"}) scale(.99)`,
                "translateY(0px) rotate(0deg) scale(1)",
              ],
            },
            { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
          );
          const cards = element.querySelectorAll<HTMLElement>(
            ".lesson-card, .track-card, .track, .academy-track-grid > a, .deep-dives a, .api-catalog button, .ai-layer-inspector button, .ai-checklist article, .pattern-menu button, .chapter-points > div, .lesson-outcome, .ood-panel, .road",
          );
          if (cards.length) {
            animate(
              [...cards].slice(0, 8),
              {
                opacity: [0.84, 1],
                transform: [
                  "translateY(18px) rotate(-0.6deg) scale(.985)",
                  "translateY(0px) rotate(0deg) scale(1)",
                ],
              },
              { duration: 0.52, delay: stagger(0.04), ease: [0.16, 1, 0.3, 1] },
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
    let previous = scrollY;
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const delta = Math.max(-24, Math.min(24, scrollY - previous));
        document.documentElement.style.setProperty(
          "--scroll-progress",
          `${max ? (scrollY / max) * 100 : 0}%`,
        );
        document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);
        document.documentElement.style.setProperty("--scroll-drift", `${delta}px`);
        document.documentElement.style.setProperty(
          "--graffiti-drift",
          `${(scrollY * 0.075) % 720}px`,
        );
        previous = scrollY;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let lastPointerUpdate = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || reducedMotion) return;
      if (event.timeStamp - lastPointerUpdate < 42) return;
      lastPointerUpdate = event.timeStamp;
      cancelAnimationFrame(pointerRaf.current);
      pointerRaf.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
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
      });
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      stopInView.forEach((stop) => stop());
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(pointerRaf.current);
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
