import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PublicTopicActions from "@/components/topics/PublicTopicActions";
import { Metadata } from "next";
import { NeoHeader, NeoPage, NeoPanel, NeoSectionTitle } from "@/components/ui/neo";

async function getTopic(shareId: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
  try {
    const res = await fetch(`${apiBase}/api/topic-share/public/${shareId}`, {
      // Use Next.js fetch cache options here if needed, 
      // e.g., next: { revalidate: 60 } for ISR
      cache: "no-store", 
    });
    
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch public topic:", error);
    return null;
  }
}

export async function generateMetadata(
  props: { params: Promise<{ shareId: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const topic = await getTopic(params.shareId);

  if (!topic) {
    return {
      title: "Topic Not Found - Lingofy",
    };
  }

  return {
    title: `${topic.title} - Shared Topic on Lingofy`,
    description: `Master new words with this shared topic: ${topic.title}.`,
    openGraph: {
      title: topic.title,
      description: `Master new words with this shared topic: ${topic.title}.`,
      type: "website",
    },
  };
}

export default async function PublicTopicPage(
  props: { params: Promise<{ shareId: string }> }
) {
  const params = await props.params;
  const topic = await getTopic(params.shareId);

  if (!topic) {
    return (
      <NeoPage className="max-w-5xl">
        <NeoPanel className="p-6">
          <h1 className="text-2xl font-black text-red-300">
            Topic not found or share has expired
          </h1>
          <p className="mt-2 text-muted-foreground">
            The topic you're trying to access is no longer available.
          </p>
        </NeoPanel>
      </NeoPage>
    );
  }

  return (
    <NeoPage className="max-w-6xl">
      <NeoHeader
        eyebrow={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{topic.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        title={topic.title}
        description={topic.project ? `Project: ${topic.project.title}` : "Shared vocabulary topic"}
        actions={<PublicTopicActions topic={topic} />}
        className="mb-8"
      />

      <div className="space-y-6">
        <div>
          {topic.vocabulary && topic.vocabulary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.vocabulary.map((vocab: any) => (
                <NeoPanel key={vocab.id} className="p-5">
                  <div className="space-y-2">
                    {vocab.word && (
                      <div>
                        <p className="text-sm font-black uppercase text-muted-foreground">Word</p>
                        <p className="text-2xl font-black text-white">{vocab.word}</p>
                      </div>
                    )}
                    {vocab.pronunciation && (
                      <div>
                        <p className="text-sm font-black uppercase text-muted-foreground">Pronunciation</p>
                        <p className="text-sm md:text-base text-muted-foreground">{vocab.pronunciation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-black uppercase text-muted-foreground">Meaning</p>
                      <p className="text-sm md:text-base text-white">{vocab.meaning}</p>
                    </div>
                    {vocab.image && (
                      <div className="relative w-full h-32">
                        <Image
                          src={vocab.image}
                          alt={vocab.word || "Vocabulary image"}
                          fill
                          className="rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </NeoPanel>
              ))}
            </div>
          ) : (
            <NeoPanel subtle className="p-8 text-center">
              <p className="text-muted-foreground">No vocabulary items yet.</p>
            </NeoPanel>
          )}
        </div>

        {topic.contextualPracticeContent && (
          <div>
            <NeoSectionTitle title="Story" className="mb-4" />
            <NeoPanel className="p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {typeof topic.contextualPracticeContent === "string" ? (
                  <p>{topic.contextualPracticeContent}</p>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(topic.contextualPracticeContent, null, 2)}
                  </pre>
                )}
              </div>
            </NeoPanel>
          </div>
        )}
      </div>
    </NeoPage>
  );
}
