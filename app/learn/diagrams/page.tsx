import { diagramLessons } from "../academy-data";
import { TrackHub } from "../TrackHub";

export default function DiagramHub() {
  return <TrackHub eyebrow="VISUAL MODELING" title="Draw the system." accent="See how it behaves." description="A page-by-page diagram course covering UML class and sequence diagrams, data-flow diagrams, entity relationships, and state machines." lessons={diagramLessons} />;
}
