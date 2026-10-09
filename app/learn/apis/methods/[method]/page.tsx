import { notFound } from "next/navigation";
import { RestMethodLab } from "../../../RestMethodLab";
import { restMethods } from "../../../rest-method-data";

export function generateStaticParams() { return restMethods.map(({ slug }) => ({ method: slug })); }
export default async function RestMethodPage({ params }: { params: Promise<{ method: string }> }) { const { method } = await params; const item = restMethods.find(value => value.slug === method); if (!item) notFound(); return <RestMethodLab item={item} />; }
