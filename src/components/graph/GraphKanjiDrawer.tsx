"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKanjiDetails } from "@/hooks/use-kanji-details";

interface GraphKanjiDrawerProps {
    word: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function GraphKanjiDrawer({ word, isOpen, onClose }: GraphKanjiDrawerProps) {
    const [kanjis, setKanjis] = useState<string[]>([]);
    const [selectedKanji, setSelectedKanji] = useState<string>("");
    
    const { data: details, isLoading } = useKanjiDetails(selectedKanji, isOpen);

    // Neo-brutalism Whiteboard styles
    const styles = {
        container: "absolute bottom-0 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[75%] lg:w-[65%] h-[65%] bg-white border-t-[4px] border-x-[4px] border-black shadow-[0_-8px_0px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-500 ease-in-out",
        open: "translate-y-0 opacity-100",
        closed: "translate-y-full opacity-0",
        header: "px-6 py-3 border-b-[4px] border-black bg-zinc-50 shrink-0 flex items-center justify-between",
        title: "text-xl font-black uppercase tracking-tighter text-black",
        closeBtn: "bg-white border-[3px] border-black p-1 hover:bg-zinc-100 shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all",
        tabsList: "bg-zinc-100 border-b-[3px] border-black p-1 gap-2 rounded-none h-auto",
        tabsTrigger: "px-4 py-2 font-black border-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-white data-[state=active]:shadow-[2px_2px_0px_black] transition-all rounded-none text-black/60 data-[state=active]:text-black",
        mainCard: "border-[4px] border-black shadow-[6px_6px_0px_black] rounded-none bg-white p-6 mb-8",
        label: "text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1",
        value: "text-lg font-bold text-black",
        kanjiLarge: "text-8xl font-black text-black leading-none",
        subCard: "bg-zinc-50 border-[3px] border-black rounded-none p-4",
        badge: "bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase rounded-none shrink-0",
        hintBox: "bg-zinc-50 border-[3px] border-black p-4 text-black text-sm leading-relaxed [&_img]:h-[1.2em] [&_img]:w-auto [&_img]:inline-block [&_img]:align-text-bottom [&_img]:mx-0.5 [&_img]:filter [&_img]:grayscale [&_img]:contrast-125 [&_img]:brightness-90",
        exampleItem: "flex flex-col p-4 border-[3px] border-black bg-white hover:bg-zinc-50 transition-colors shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] text-black"
    };

    useEffect(() => {
        if (word && isOpen) {
            const kanjiCharacters = word.match(/[\u4e00-\u9faf]/g) || [];
            const uniqueKanjis = Array.from(new Set(kanjiCharacters));
            setKanjis(uniqueKanjis);
            if (uniqueKanjis.length > 0) {
                setSelectedKanji(uniqueKanjis[0]);
            } else {
                setSelectedKanji("");
            }
        }
    }, [word, isOpen]);

    if (!word) return null;

    return (
        <div 
            className={cn(
                styles.container,
                isOpen ? styles.open : styles.closed
            )}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>
                    Word: <span className="underline decoration-[4px] underline-offset-4">{word}</span>
                </div>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X className="h-5 w-5 stroke-[3px]" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
                {kanjis.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center font-bold text-zinc-400 uppercase tracking-widest">
                        No Kanji found in this word
                    </div>
                ) : (
                    <Tabs value={selectedKanji} onValueChange={setSelectedKanji} className="flex-1 flex flex-col min-h-0">
                        {kanjis.length > 1 && (
                            <TabsList className={styles.tabsList}>
                                {kanjis.map(k => (
                                    <TabsTrigger key={k} value={k} className={styles.tabsTrigger}>
                                        {k}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        )}

                        <div className="flex-1 relative min-h-0">
                            {kanjis.map(k => (
                                <TabsContent 
                                    key={k} 
                                    value={k} 
                                    className="absolute inset-0 m-0 data-[state=inactive]:hidden flex flex-col"
                                >
                                    <ScrollArea className="flex-1">
                                        <div className="p-8 space-y-10">
                                            {isLoading ? (
                                                <div className="flex flex-col items-center justify-center h-40 gap-4">
                                                    <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3px]" />
                                                    <span className="font-black uppercase tracking-tighter text-black">Fetching Knowledge...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Main Card */}
                                                    <div className={styles.mainCard}>
                                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                            <div className="lg:col-span-3 flex flex-col items-center justify-center border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-black pb-6 lg:pb-0">
                                                                <span className={styles.kanjiLarge}>{k}</span>
                                                            </div>
                                                            <div className="lg:col-span-9 flex flex-col justify-center space-y-6">
                                                                <div>
                                                                    <div className={cn(styles.label, "text-black/60")}>Meaning</div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-3xl font-black uppercase tracking-tighter text-black">{details?.meaning || "—"}</span>
                                                                        {details?.hanviet && (
                                                                            <Badge className={styles.badge}>{details.hanviet}</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className={styles.subCard}>
                                                                        <div className={cn(styles.label, "text-black/60")}>Onyomi</div>
                                                                        <div className="text-xl font-bold text-black">{details?.onyomi || "—"}</div>
                                                                    </div>
                                                                    <div className={styles.subCard}>
                                                                        <div className={cn(styles.label, "text-black/60")}>Kunyomi</div>
                                                                        <div className="text-xl font-bold text-black">{details?.kunyomi || "—"}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Secondary Info */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                        <div className="space-y-8">
                                                            {details?.hint && (
                                                                <div>
                                                                    <div className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-black">
                                                                        <div className="w-4 h-4 bg-black" /> Mnemonic Hint
                                                                    </div>
                                                                    <div 
                                                                        className={styles.hintBox}
                                                                        dangerouslySetInnerHTML={{ __html: details.hint }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {details?.radicals && details.radicals.length > 0 && (
                                                                <div>
                                                                    <div className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-black">
                                                                        <div className="w-4 h-4 bg-black" /> Radicals
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {details.radicals.map((r: any, i: number) => (
                                                                            <div key={i} className="px-3 py-2 border-[3px] border-black bg-white flex items-center gap-2 shadow-[3px_3px_0px_black] text-black">
                                                                                <span className="text-2xl font-black">{r.radical}</span>
                                                                                <span className="text-[10px] font-bold uppercase border-l-2 border-black pl-2 text-black">{r.hanviet}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-6">
                                                            <Tabs defaultValue="vn">
                                                                <TabsList className={cn(styles.tabsList, "bg-zinc-100")}>
                                                                    <TabsTrigger value="vn" className={cn(styles.tabsTrigger, "text-black/60 data-[state=active]:text-black")}>Vietnamese</TabsTrigger>
                                                                    <TabsTrigger value="en" className={cn(styles.tabsTrigger, "text-black/60 data-[state=active]:text-black")}>English</TabsTrigger>
                                                                </TabsList>
                                                                <TabsContent value="vn" className="mt-6 space-y-4">
                                                                    {details?.examples?.vn?.map((ex: any, i: number) => (
                                                                        <div key={i} className={styles.exampleItem}>
                                                                            <div className="flex items-baseline gap-3 mb-1">
                                                                                <span className="text-xl font-black text-black">{ex.word}</span>
                                                                                <span className="text-xs font-bold text-black/40">{ex.kana}</span>
                                                                            </div>
                                                                            <div className="text-sm font-bold text-black">{ex.mean}</div>
                                                                        </div>
                                                                    ))}
                                                                </TabsContent>
                                                                <TabsContent value="en" className="mt-6 space-y-4">
                                                                    {details?.examples?.en?.map((ex: any, i: number) => (
                                                                        <div key={i} className={styles.exampleItem}>
                                                                            <div className="flex items-baseline gap-3 mb-1">
                                                                                <span className="text-xl font-black text-black">{ex.japanese}</span>
                                                                                <span className="text-xs font-bold text-black/40">{ex.reading}</span>
                                                                            </div>
                                                                            <div className="text-sm font-bold text-black">{ex.english}</div>
                                                                        </div>
                                                                    ))}
                                                                </TabsContent>
                                                            </Tabs>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
