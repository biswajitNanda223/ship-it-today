"use client";
import { animate, inView, stagger } from "motion";
import { useEffect, useRef } from "react";

export function MotionLayer() {
  const raf = useRef(0);
  useEffect(() => {
    const targets = [
      ...document.querySelectorAll<HTMLElement>(
        "main section, .course-hero, .public-api-hero, .hld-canvas, .pattern-workbench, .request-studio, .ddia-studio",
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
            { opacity: [0.82, 1], transform: ["translateY(24px)", "translateY(0px)"] },
            { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          );
          const cards = element.querySelectorAll<HTMLElement>(
            ".lesson-card, .track-card, .deep-dives a, .ai-layer-inspector button, .ai-checklist article, .pattern-menu button",
          );
          if (cards.length) {
            animate(
              cards,
              {
                opacity: [0.84, 1],
                transform: ["translateY(16px) scale(.985)", "translateY(0px) scale(1)"],
              },
              { duration: 0.5, delay: stagger(0.045), ease: [0.22, 1, 0.36, 1] },
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
    return () => {
      stopInView.forEach((stop) => stop());
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="ambient-beam" aria-hidden="true" />
    </>
  );
}
