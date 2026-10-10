import { notFound } from "next/navigation";
import { PublicApiLab } from "../../PublicApiLab";
import { publicApiCategories } from "../../public-api-data";

export function generateStaticParams() { return publicApiCategories.map(({ slug }) => ({ category: slug })); }
export default async function PublicApiCategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; const item = publicApiCategories.find(value => value.slug === category); if (!item) notFound(); return <PublicApiLab category={item} />; }
