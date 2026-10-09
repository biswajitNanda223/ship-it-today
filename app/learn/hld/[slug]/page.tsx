import { notFound } from "next/navigation";
import { hldLessons } from "../../academy-data";
import { LessonExperience } from "../../LessonExperience";

export function generateStaticParams() { return hldLessons.map(({ slug }) => ({ slug })); }
export default async function HldLessonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = hldLessons.find(lesson => lesson.slug === slug); if (!item) notFound(); return <LessonExperience lesson={item} siblings={hldLessons} />; }
