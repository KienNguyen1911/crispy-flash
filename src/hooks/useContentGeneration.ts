import { useCallback, useRef } from "react";
import { useGenerationWebSocket } from "@/hooks/useGenerationWebSocket";
import { generateContent } from "@/services/topics-api";
import { useToast } from "@/hooks/use-toast";
import type { AIGeneratedContent } from "@/lib/types";

interface UseContentGenerationProps {
  topicId: string;
  projectOwnerId?: string;
  hasVocabulary: boolean;
  onContentGenerated: (content: AIGeneratedContent) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
}

export const useContentGeneration = ({
  topicId,
  projectOwnerId,
  hasVocabulary,
  onContentGenerated,
  onGeneratingChange,
}: UseContentGenerationProps) => {
  const { toast } = useToast();
  const shouldListenWebSocketRef = useRef(false);

  const handleGenerateWithSettings = useCallback(
    async (
      language: "english" | "vietnamese",
      difficulty: "easy" | "medium" | "hard",
    ) => {
      onGeneratingChange(true);

      try {
        const response = await generateContent(topicId, language, difficulty);

        if (!response.ok || !response.jobId) {
          throw new Error("Failed to trigger content generation");
        }

        toast({
          title: "Generating content...",
          description: "Please wait while we create your story.",
        });

        shouldListenWebSocketRef.current = true;
      } catch (error) {
        console.error("Content generation error:", error);
        onGeneratingChange(false);
        toast({
          title: "Generation failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to trigger content generation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [topicId, toast, onGeneratingChange],
  );

  useGenerationWebSocket(
    shouldListenWebSocketRef.current && projectOwnerId ? projectOwnerId : undefined,
    topicId,
    async (content) => {
      onGeneratingChange(false);
      shouldListenWebSocketRef.current = false;
      onContentGenerated(content as AIGeneratedContent);
    },
    (error) => {
      onGeneratingChange(false);
      shouldListenWebSocketRef.current = false;
      toast({
        title: "Generation failed",
        description: error,
        variant: "destructive",
      });
    },
  );

  return { handleGenerateWithSettings };
};
