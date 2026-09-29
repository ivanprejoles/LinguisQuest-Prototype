import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ languageId: string }>;
}

export default async function StageFallbackPage({ params }: PageProps) {
  const { languageId } = await params;
  redirect(`/foundation/${languageId}`);
}