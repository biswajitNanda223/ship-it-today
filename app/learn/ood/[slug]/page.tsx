import { notFound } from "next/navigation";
import { LessonExperience } from "../../LessonExperience";
import { oodLessons } from "../ood-data";

export function generateStaticParams() {
  return oodLessons.map(({ slug }) => ({ slug }));
}

export default async function OodLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = oodLessons.find((item) => item.slug === slug);
  if (!lesson) notFound();
  return <LessonExperience lesson={lesson} siblings={oodLessons} />;
}
