import Link from "next/link";
import { TrackHub } from "../TrackHub";
import { oodLessons } from "./ood-data";

export default function OodHub() {
  return (
    <TrackHub
      eyebrow="PYTHON OOD LAB"
      title="Model the domain."
      accent="Ship it with FastAPI."
      description="Eleven original interview-scale object designs. Every case moves from requirements and invariants to class responsibilities, patterns, FastAPI contracts, and concurrency tests."
      lessons={oodLessons}
      extra={
        <section className="hub-callout shell ood-source-note">
          <div>
            <span>ORIGINAL LEARNING IMPLEMENTATION</span>
            <h2>Python-first, source-aware, and independent.</h2>
            <p>
              These lessons use original explanations and code. ByteByteGo is listed only as an
              external study resource; Ship It Today is not affiliated with ByteByteGo.
            </p>
          </div>
          <Link
            href="https://github.com/ByteByteGoHq/ood-interview"
            target="_blank"
            rel="noreferrer"
          >
            View external reference <i>↗</i>
          </Link>
        </section>
      }
    />
  );
}
