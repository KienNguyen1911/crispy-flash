"use client";

import { useState } from "react";
import { Copy, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LearnModePublic from "@/components/LearnModePublic";

interface PublicTopicActionsProps {
  topic: any; // We'll pass the full topic or just what's needed
}

export default function PublicTopicActions({ topic }: PublicTopicActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isLearnModeOpen, setIsLearnModeOpen] = useState(false);
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

  return (
    <>
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

      {isLearnModeOpen && topic.vocabulary && (
        <LearnModePublic
          topicTitle={topic.title}
          vocabulary={topic.vocabulary}
          onClose={() => setIsLearnModeOpen(false)}
        />
      )}
    </>
  );
}
