"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topic } from "@/lib/types";
import { format } from "date-fns";

interface TopicSwitcherProps {
  projectId: string;
  currentTopicId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopicSwitcher({
  projectId,
  currentTopicId,
  isOpen,
  onOpenChange,
}: TopicSwitcherProps) {
  const router = useRouter();
  const fetcher = useAuthFetcher();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const isKeyboardMode = React.useRef(false);
  const lastMousePos = React.useRef({ x: 0, y: 0 });

  const { data: topics = [], isLoading } = useSWR<Topic[]>(
    isOpen ? `/api/projects/${projectId}/topics` : null,
    fetcher
  );

  const filteredTopics = React.useMemo(() => {
    return [...topics]
      .filter((topic) =>
        topic.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [topics, search]);

  React.useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      isKeyboardMode.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (selectedIndex >= filteredTopics.length) {
      setSelectedIndex(Math.max(0, filteredTopics.length - 1));
    }
  }, [filteredTopics.length, selectedIndex]);

  React.useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex] && isKeyboardMode.current) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (topicId: string) => {
    if (topicId === currentTopicId) {
      onOpenChange(false);
      return;
    }
    onOpenChange(false);
    router.push(`/projects/${projectId}/topics/${topicId}?viewMode=graph`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      isKeyboardMode.current = true;
      setSelectedIndex((prev) => (prev + 1) % filteredTopics.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      isKeyboardMode.current = true;
      setSelectedIndex((prev) => (prev - 1 + filteredTopics.length) % filteredTopics.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTopics[selectedIndex]) {
        handleSelect(filteredTopics[selectedIndex].id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      lastMousePos.current.x !== e.clientX ||
      lastMousePos.current.y !== e.clientY
    ) {
      isKeyboardMode.current = false;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-[4px] border-black shadow-[8px_8px_0px_black] rounded-none bg-white text-black">
        <DialogTitle className="sr-only">Switch Topic</DialogTitle>
        <div className="flex items-center border-b-[4px] border-black px-4 bg-zinc-50 h-16">
          <Search className="mr-3 h-5 w-5 text-black shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-bold placeholder:text-zinc-400 placeholder:font-medium text-black px-0"
          />
          <div className="flex items-center gap-1 bg-black text-white px-2 py-1 text-[10px] font-black uppercase rounded-sm shrink-0">
            <Command className="h-3 w-3" />
            <span>P</span>
          </div>
        </div>

        <ScrollArea 
          className="max-h-[400px]"
          onMouseMove={handleMouseMove}
        >
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 font-bold italic">
              Loading topics...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-bold italic">
              No topics found
            </div>
          ) : (
            <div className="p-2">
              {filteredTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => handleSelect(topic.id)}
                  onMouseEnter={() => {
                    if (!isKeyboardMode.current) {
                      setSelectedIndex(index);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-2 border-transparent",
                    index === selectedIndex
                      ? "bg-zinc-100 border-black shadow-[4px_4px_0px_black] -translate-y-1 -translate-x-1"
                      : "hover:bg-zinc-50",
                    topic.id === currentTopicId && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 border-2 border-black",
                      index === selectedIndex ? "bg-black text-white" : "bg-white text-black"
                    )}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-black uppercase tracking-tight">
                        {topic.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Created {format(new Date(topic.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  {topic.id === currentTopicId && (
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 font-black uppercase">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 bg-zinc-50 border-t-[4px] border-black flex justify-between items-center text-black">
            <div className="flex gap-4">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500">
                    <span className="border border-zinc-300 px-1 rounded bg-white text-black">↑↓</span> Navigate
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500">
                    <span className="border border-zinc-300 px-1 rounded bg-white text-black">Enter</span> Select
                </div>
            </div>
            <div className="text-[10px] font-black uppercase text-zinc-400">
                {filteredTopics.length} Topics
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
