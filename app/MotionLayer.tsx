"use client";
import { useEffect, useRef } from "react";

export function MotionLayer(){
  const raf=useRef(0);
  useEffect(()=>{
    const targets=[...document.querySelectorAll<HTMLElement>("main section, .course-hero, .public-api-hero, .hld-canvas, .pattern-workbench, .request-studio, .ddia-studio")];
    targets.forEach((el,i)=>{el.classList.add("scroll-reveal");el.style.setProperty("--reveal-delay",`${Math.min(i%4,3)*45}ms`)});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.09,rootMargin:"0px 0px -6% 0px"});
    targets.forEach(el=>observer.observe(el));
    let previous=scrollY;
    const onScroll=()=>{cancelAnimationFrame(raf.current);raf.current=requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;const delta=Math.max(-24,Math.min(24,scrollY-previous));document.documentElement.style.setProperty("--scroll-progress",`${max?scrollY/max*100:0}%`);document.documentElement.style.setProperty("--scroll-y",`${scrollY}px`);document.documentElement.style.setProperty("--scroll-drift",`${delta}px`);previous=scrollY})};
    onScroll();addEventListener("scroll",onScroll,{passive:true});
    return()=>{observer.disconnect();removeEventListener("scroll",onScroll);cancelAnimationFrame(raf.current)};
  },[]);
  return <><div className="scroll-progress" aria-hidden="true"/><div className="ambient-orb" aria-hidden="true"/><div className="motion-film" aria-hidden="true"><i/><i/><i/><i/><i/></div></>;
}
