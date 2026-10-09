"use client";
import { useMemo, useState } from "react";
import { LearnNav } from "../LearnNav";
import { patterns } from "../data";

export default function PatternsPage(){
  const [family,setFamily]=useState("All"); const [active,setActive]=useState(0); const [done,setDone]=useState<string[]>([]);
  const filtered=useMemo(()=>family==="All"?patterns:patterns.filter(p=>p.family===family),[family]);
  const pattern=filtered[Math.min(active,filtered.length-1)]??patterns[0];
  const toggle=()=>setDone(d=>d.includes(pattern.name)?d.filter(x=>x!==pattern.name):[...d,pattern.name]);
  return <main className="course-page"><LearnNav/><header className="course-hero shell"><span className="course-index">LLD / 01</span><h1>25 design patterns.<br/><em>Built, not memorized.</em></h1><p>Creational, structural, behavioral, and enterprise patterns with TypeScript examples, animated relationships, trade-offs, and a progress tracker.</p><div className="course-metrics"><b>25<span>PATTERNS</span></b><b>4<span>FAMILIES</span></b><b>{done.length}<span>MASTERED</span></b></div></header>
  <section className="pattern-course shell"><div className="filter-row">{["All","Creational","Structural","Behavioral","Enterprise"].map(f=><button className={family===f?"active":""} key={f} onClick={()=>{setFamily(f);setActive(0)}}>{f}</button>)}</div><div className="pattern-workbench"><aside>{filtered.map((p,i)=><button key={p.name} className={active===i?"active":""} onClick={()=>setActive(i)}><span>{String(patterns.indexOf(p)+1).padStart(2,"0")}</span><div><small>{p.family}</small><b>{p.name}</b></div><i>{done.includes(p.name)?"✓":"→"}</i></button>)}</aside><article key={pattern.name} className="pattern-detail"><div className="pattern-map"><div className="pm-orbit a"/><div className="pm-orbit b"/><div className="pm-core">{pattern.name}</div><div className="pm-node n1">CLIENT</div><div className="pm-node n2">ABSTRACTION</div><div className="pm-node n3">IMPLEMENTATION</div><div className="pm-packet"/></div><div className="pattern-copy"><span>{pattern.family.toUpperCase()} PATTERN</span><h2>{pattern.name}</h2><p>{pattern.intent}</p><dl><dt>USE IT FOR</dt><dd>{pattern.use}</dd></dl><div className="course-code"><div><span>TypeScript</span><i>production-shaped</i></div><pre>{pattern.code}</pre></div><button className={done.includes(pattern.name)?"mastered":""} onClick={toggle}>{done.includes(pattern.name)?"✓ Marked as mastered":"Mark pattern as mastered"}</button></div></article></div></section></main>;
}
