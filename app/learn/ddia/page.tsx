import Link from "next/link";
import { ddiaLessons } from "../ddia-data";
import { TrackHub } from "../TrackHub";

export default function DdiaHub() {
  return <TrackHub eyebrow="DATA-INTENSIVE SYSTEMS" title="Follow the data." accent="Defend every guarantee." description="A twelve-part original study companion covering the major data-system concepts: storage, models, encoding, replication, partitioning, transactions, distributed failure, consensus, batch, streams, and derived data." lessons={ddiaLessons} extra={<section className="hub-callout shell ddia-source"><div><span>PRIMARY REFERENCE</span><h2>Continue with the original book.</h2><p>These pages contain original explanations, diagrams, exercises, and code—not reproduced book text.</p></div><Link href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank">Official DDIA page <i>↗</i></Link></section>} />;
}
