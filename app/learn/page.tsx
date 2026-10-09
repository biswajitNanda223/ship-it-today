import Link from "next/link";
import { LearnNav } from "./LearnNav";
import { apiLessons, diagramLessons, hldLessons, lldLessons } from "./academy-data";

const academyTracks = [
  { code:"01", title:"High-level design", href:"/learn/hld", copy:"Architecture case studies from requirements to rollout.", lessons:hldLessons, color:"purple" },
  { code:"02", title:"Low-level design", href:"/learn/lld", copy:"UML, SOLID, patterns, and production object modeling.", lessons:lldLessons, color:"cyan" },
  { code:"03", title:"Diagram studio", href:"/learn/diagrams", copy:"Class, sequence, DFD, ERD, and state diagrams.", lessons:diagramLessons, color:"orange" },
  { code:"04", title:"REST API engineering", href:"/learn/apis", copy:"Every method, security, performance, webhooks, and testing.", lessons:apiLessons, color:"pink" },
];

export default function AcademyPage() {
  const chapterCount = academyTracks.reduce((total, track) => total + track.lessons.reduce((sum, item) => sum + item.steps.length, 0), 0);
  return <main className="course-page academy-home"><LearnNav/><header className="academy-home-hero shell"><span className="course-index">SHIP IT TODAY ACADEMY</span><h1>Learn system design<br/><em>one decision at a time.</em></h1><p>A structured, original visual curriculum: separate lessons, animated request flows, production code, UML, DFDs, and complete end-to-end case studies.</p><div><b>20<span>LESSON PAGES</span></b><b>{chapterCount}<span>CHAPTERS</span></b><b>20<span>ANIMATED MODELS</span></b></div></header><section className="academy-track-grid shell">{academyTracks.map(track => <Link href={track.href} key={track.code} className={track.color}><header><span>{track.code}</span><i>{track.lessons.length} lessons</i></header><div className="track-orbit"><i/><i/><b>{track.title.split(" ")[0]}</b></div><article><h2>{track.title}</h2><p>{track.copy}</p><span>Explore track →</span></article></Link>)}</section><section className="academy-principles shell"><span>HOW TO USE THE ACADEMY</span><div>{[["01","Watch the flow","Play the architecture walkthrough before reading implementation details."],["02","Read the trade-off","Every component exists because of a requirement or failure mode."],["03","Build the code","Use the examples as a starting point, then complete the design review."],["04","Explain it back","A design is learned when you can defend it under changing constraints."]].map(item => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div></section></main>;
}
