import { notFound } from "next/navigation";
import { apiLessons } from "../../academy-data";
import { LessonExperience } from "../../LessonExperience";

export function generateStaticParams() { return apiLessons.map(({ slug }) => ({ slug })); }
export default async function ApiLessonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = apiLessons.find(lesson => lesson.slug === slug); if (!item) notFound(); return <LessonExperience lesson={item} siblings={apiLessons} />; }
