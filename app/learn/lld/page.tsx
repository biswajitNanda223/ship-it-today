import Link from "next/link";
import { lldLessons } from "../academy-data";
import { TrackHub } from "../TrackHub";

export default function LldHub() {
  return <TrackHub eyebrow="LLD TRACK" title="Design objects." accent="Make change inexpensive." description="Learn UML, SOLID, clean boundaries, object modeling, state, and production design patterns through complete TypeScript examples." lessons={lldLessons} extra={<section className="hub-callout shell"><div><span>COMPLETE PATTERN LIBRARY</span><h2>Practice all 25 design patterns.</h2><p>Explore creational, structural, behavioral, and enterprise patterns in the interactive workbench.</p></div><Link href="/learn/patterns">Open 25-pattern workbench <i>→</i></Link></section>} />;
}
