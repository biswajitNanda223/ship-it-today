import { hldLessons } from "../academy-data";
import { TrackHub } from "../TrackHub";

export default function HldHub() {
  return <TrackHub eyebrow="HLD TRACK" title="Design systems." accent="Defend every trade-off." description="Original, case-study-driven system design lessons covering requirements, scale, storage, communication, reliability, security, observability, and rollout." lessons={hldLessons} />;
}
