import { notFound } from "next/navigation";
import { lldLessons } from "../../academy-data";
import { LessonExperience } from "../../LessonExperience";

export function generateStaticParams() { return lldLessons.map(({ slug }) => ({ slug })); }
export default async function LldLessonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = lldLessons.find(lesson => lesson.slug === slug); if (!item) notFound(); return <LessonExperience lesson={item} siblings={lldLessons} />; }
