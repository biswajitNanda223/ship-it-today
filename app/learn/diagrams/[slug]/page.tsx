import { notFound } from "next/navigation";
import { diagramLessons } from "../../academy-data";
import { LessonExperience } from "../../LessonExperience";

export function generateStaticParams() { return diagramLessons.map(({ slug }) => ({ slug })); }
export default async function DiagramLessonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = diagramLessons.find(lesson => lesson.slug === slug); if (!item) notFound(); return <LessonExperience lesson={item} siblings={diagramLessons} />; }
