"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";

interface ShareTopicDialogProps {
  topicId: string;
  topicTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareTopicDialog({
  topicId,
  topicTitle,
  isOpen,
  onOpenChange,
}: ShareTopicDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const fetcher = useAuthFetcher();

  const handleCreateShare = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt_token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
      const response = await fetch(`${apiBase}/api/topic-share/${topicId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      toast({
        title: "Share link created",
        description: "You can now share this link with others",
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicId, toast]);

  const handleCopyLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl, toast]);

  const handleDeleteShare = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt_token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
      const response = await fetch(`${apiBase}/api/topic-share/${topicId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete share link");
      }

      setShareUrl(null);
      toast({
        title: "Share link deleted",
        description: "This topic is no longer shared",
      });
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicId, toast]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && !shareUrl) {
        // Load share status when opening
        handleCreateShare();
      }
      onOpenChange(open);
    },
    [shareUrl, handleCreateShare, onOpenChange],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{topicTitle}"</DialogTitle>
          <DialogDescription>
            Create a public link to share this topic with others. They will be
            able to view the vocabulary and story, but cannot edit anything.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {shareUrl ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    disabled={isLoading}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                ✓ This topic is now public and can be shared
              </div>

              <Button
                variant="destructive"
                onClick={handleDeleteShare}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Share Link"
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCreateShare}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Share Link"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
