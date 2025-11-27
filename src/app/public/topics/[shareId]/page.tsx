"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LearnModePublic from "@/components/LearnModePublic";

export default function PublicTopicPage() {
  const params = useParams<{ shareId: string }>();
  const { shareId } = params;
  const [copied, setCopied] = useState(false);
  const [isLearnModeOpen, setIsLearnModeOpen] = useState(false);

  // Use public fetcher (no auth required)
  const fetcher = async (url: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
    const fullUrl = url.startsWith("http") ? url : `${apiBase}${url}`;
    const res = await fetch(fullUrl);
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  };

  const {
    data: topic,
    error,
    isLoading,
  } = useSWR(shareId ? `/api/topic-share/public/${shareId}` : null, fetcher);

  const { toast } = useToast();

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Separator />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !topic) {
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
          <div className="flex gap-2">
            {topic.vocabulary && topic.vocabulary.length > 0 && (
              <Button
                size="sm"
                onClick={() => setIsLearnModeOpen(true)}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Learn Mode
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
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

        {isLearnModeOpen && topic.vocabulary && (
          <LearnModePublic
            topicTitle={topic.title}
            vocabulary={topic.vocabulary}
            onClose={() => setIsLearnModeOpen(false)}
          />
        )}
    </div>
  );
}
