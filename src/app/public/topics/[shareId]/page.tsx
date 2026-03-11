import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PublicTopicActions from "@/components/topics/PublicTopicActions";

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

export default async function PublicTopicPage(
  props: { params: Promise<{ shareId: string }> }
) {
  const params = await props.params;
  const topic = await getTopic(params.shareId);

  if (!topic) {
    return (
      <div className="container mx-auto max-w-5xl p-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-600">
            Topic not found or share has expired
          </h1>
          <p className="text-gray-600 mt-2">
            The topic you're trying to access is no longer available.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
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
          
          {/* Extract client-side interactive actions */}
          <PublicTopicActions topic={topic} />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
          {topic.project && (
            <p className="text-gray-600">Project: {topic.project.title}</p>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          {topic.vocabulary && topic.vocabulary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.vocabulary.map((vocab: any) => (
                <Card key={vocab.id} className="p-4">
                  <div className="space-y-2">
                    {vocab.word && (
                      <div>
                        <p className="text-sm text-gray-600">Word</p>
                        <p className="text-lg font-semibold">{vocab.word}</p>
                      </div>
                    )}
                    {vocab.pronunciation && (
                      <div>
                        <p className="text-sm text-gray-600">Pronunciation</p>
                        <p className="text-sm">{vocab.pronunciation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Meaning</p>
                      <p className="text-sm">{vocab.meaning}</p>
                    </div>
                    {vocab.image && (
                      <div>
                        <img
                          src={vocab.image}
                          alt={vocab.word}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No vocabulary items yet.</p>
          )}
        </div>

        {topic.contextualPracticeContent && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Story</h2>
            <Card className="p-6 bg-blue-50">
              <div className="prose prose-sm max-w-none">
                {typeof topic.contextualPracticeContent === "string" ? (
                  <p>{topic.contextualPracticeContent}</p>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(topic.contextualPracticeContent, null, 2)}
                  </pre>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
