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
    const stopInView = targets.map((element) => {
      if (reducedMotion) return () => undefined;
      return inView(
        element,
        () => {
          animate(
            element,
            {
              opacity: [0.7, 1],
              transform: ["translateY(30px) scale(.99)", "translateY(0px) scale(1)"],
            },
            { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
          );
          const cards = element.querySelectorAll<HTMLElement>(
            ".lesson-card, .track-card, .deep-dives a, .ai-layer-inspector button, .ai-checklist article, .pattern-menu button, .chapter-points > div, .lesson-outcome",
          );
          if (cards.length) {
            animate(
              cards,
              {
                opacity: [0.84, 1],
                transform: ["translateY(16px) scale(.985)", "translateY(0px) scale(1)"],
              },
              { duration: 0.58, delay: stagger(0.055), ease: [0.16, 1, 0.3, 1] },
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
        previous = scrollY;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || reducedMotion) return;
      cancelAnimationFrame(pointerRaf.current);
      pointerRaf.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
        const card =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>(
                ".lesson-card, .academy-track-grid > a, .deep-dives a, .track-card",
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
    </>
  );
}
