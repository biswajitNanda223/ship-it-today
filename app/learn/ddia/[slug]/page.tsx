import { notFound } from "next/navigation";
import { ddiaLessons } from "../../ddia-data";
import { LessonExperience } from "../../LessonExperience";

export function generateStaticParams() { return ddiaLessons.map(({ slug }) => ({ slug })); }
export default async function DdiaLessonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = ddiaLessons.find(lesson => lesson.slug === slug); if (!item) notFound(); return <LessonExperience lesson={item} siblings={ddiaLessons} />; }
