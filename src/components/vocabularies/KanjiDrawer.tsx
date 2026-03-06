"use client";

import React, { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink } from "lucide-react";

interface KanjiDrawerProps {
    word: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KanjiDrawer({ word, isOpen, onOpenChange }: KanjiDrawerProps) {
    const [kanjis, setKanjis] = useState<string[]>([]);
    const [selectedKanji, setSelectedKanji] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [kanjiAliveData, setKanjiAliveData] = useState<any>(null);
    const [jdictData, setJdictData] = useState<any>(null);
    const [kanjiCache, setKanjiCache] = useState<Record<string, { kanjiAlive: any, jdict: any }>>({});

    // Extract kanjis from the word when it changes
    useEffect(() => {
        if (word && isOpen) {
            const kanjiCharacters = word.match(/[\u4e00-\u9faf]/g) || [];
            const uniqueKanjis = Array.from(new Set(kanjiCharacters));
            setKanjis(uniqueKanjis);
            if (uniqueKanjis.length > 0) {
                setSelectedKanji(uniqueKanjis[0]);
            } else {
                setSelectedKanji("");
                setKanjiAliveData(null);
                setJdictData(null);
            }
        } else if (!isOpen) {
            // Optional: clear cache when drawer closes entirely to fetch fresh data next time,
            // or keep it if you want to reuse it across different words with the same kanji.
            // Let's keep it to maximize cache hits.
        }
    }, [word, isOpen]);

    // Fetch API data when selectedKanji changes
    useEffect(() => {
        const fetchKanjiData = async () => {
            if (!selectedKanji || !isOpen) return;

            // Check if we already have the data in cache
            if (kanjiCache[selectedKanji]) {
                setKanjiAliveData(kanjiCache[selectedKanji].kanjiAlive);
                setJdictData(kanjiCache[selectedKanji].jdict);
                return;
            }

            setIsLoading(true);
            setKanjiAliveData(null);
            setJdictData(null);

            try {
                const [kanjiAliveRes, jdictRes] = await Promise.allSettled([
                    fetch(`/api/kanjialive/${selectedKanji}`),
                    fetch(`https://api.jdict.net/api/v1/kanjis/${selectedKanji}`)
                ]);

                let newKanjiAliveData = null;
                let newJdictData = null;

                if (kanjiAliveRes.status === "fulfilled" && kanjiAliveRes.value.ok) {
                    const data = await kanjiAliveRes.value.json();
                    data.examples.forEach((ex: any) => {
                        // "展覧会（てんらんかい）" -> "てんらんかい"
                        ex.reading = (ex.japanese.match(/（(.*?)）/) || [])[1] || "";
                        // "展覧会（てんらんかい）" -> "展覧会"
                        ex.japanese = ex.japanese.replace(/（.*?）/g, "");
                    });
                    newKanjiAliveData = data;
                    setKanjiAliveData(data);
                }

                if (jdictRes.status === "fulfilled" && jdictRes.value.ok) {
                    const data = await jdictRes.value.json();
                    newJdictData = data;
                    setJdictData(data);
                }

                // Update Cache
                setKanjiCache(prev => ({
                    ...prev,
                    [selectedKanji]: {
                        kanjiAlive: newKanjiAliveData,
                        jdict: newJdictData
                    }
                }));

            } catch (error) {
                console.error("Error fetching Kanji data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchKanjiData();
    }, [selectedKanji, isOpen, kanjiCache]);

    if (!word || kanjis.length === 0) {
        return (
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh] rounded-t-xl">
                    <SheetHeader>
                        <SheetTitle>Kanji from {word}</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        No Kanji found in this word.
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[85vh] rounded-t-xl flex flex-col px-0 sm:px-4">
                <SheetHeader className="px-4 pb-2 border-b">
                    <SheetTitle>Word: <span className="text-primary">{word}</span></SheetTitle>
                </SheetHeader>

                <div className="flex-1 flex flex-col min-h-0 pt-4 px-4">
                    <Tabs
                        value={selectedKanji}
                        onValueChange={setSelectedKanji}
                        className="flex-1 flex flex-col"
                    >
                        {kanjis.length > 1 && (
                            <TabsList className="w-full shrink-0 flex flex-nowrap overflow-x-auto justify-start mb-4 bg-muted/50 p-1">
                                {kanjis.map((k) => (
                                    <TabsTrigger
                                        key={k}
                                        value={k}
                                        className="flex-1 sm:flex-none py-2 text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        {k}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        )}

                        <div className="flex-1 relative pb-6">
                            {kanjis.map((k) => (
                                <TabsContent
                                    key={k}
                                    value={k}
                                    className="absolute inset-0 m-0 data-[state=inactive]:hidden"
                                >
                                    <ScrollArea className="h-full pr-4">
                                        {selectedKanji === k && (
                                            <div className="space-y-8 pb-10">
                                                {isLoading ? (
                                                    <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
                                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        <p>Loading details for {k}...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Main Info Section */}
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-card rounded-lg border p-6 shadow-sm">
                                                            {/* Character */}
                                                            <div className="md:col-span-3 lg:col-span-2 flex flex-col items-center justify-center space-y-2 border-b md:border-b-0 md:border-r pb-6 md:pb-0">
                                                                <span className="text-7xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent pb-2">{k}</span>
                                                            </div>

                                                            {/* Readings & Meanings */}
                                                            <div className="md:col-span-9 lg:col-span-10 flex flex-col justify-center space-y-6 md:pl-4">
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Meaning</h4>
                                                                        {jdictData?.hanviet && (
                                                                            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-semibold uppercase tracking-wider">
                                                                                {jdictData.hanviet}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xl font-medium text-foreground">{kanjiAliveData?.meaning || "—"}</p>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className="bg-muted/30 p-4 rounded-md">
                                                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>Onyomi</h4>
                                                                        <p className="font-japanese text-xl">{kanjiAliveData?.onyomi_ja || "—"}</p>
                                                                    </div>
                                                                    <div className="bg-muted/30 p-4 rounded-md">
                                                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>Kunyomi</h4>
                                                                        <p className="font-japanese text-xl">{kanjiAliveData?.kunyomi_ja || "—"}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Details Section */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                            {/* Left Column: Radicals & Hint */}
                                                            <div className="space-y-6">
                                                                {kanjiAliveData?.hint && (
                                                                    <div>
                                                                        <h3 className="text-lg font-bold border-b pb-2 mb-4">Hint to remember</h3>
                                                                        <div
                                                                            className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-primary/5 p-4 rounded-lg border border-primary/10 [&_img]:bg-white [&_img]:rounded-md [&_img]:p-0.5 [&_img]:inline-block [&_img]:w-6 [&_img]:h-6 [&_img]:align-text-bottom [&_img]:ml-1"
                                                                            dangerouslySetInnerHTML={{ __html: kanjiAliveData.hint }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {jdictData?.radicals && jdictData.radicals.length > 0 && (
                                                                    <div>
                                                                        <h3 className="text-lg font-bold border-b pb-2 mb-4">Radicals</h3>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {jdictData.radicals.map((rad: any, i: number) => (
                                                                                <Badge key={i} variant="outline" className="flex items-center gap-1.5 py-1.5 px-3">
                                                                                    <span className="font-japanese text-lg text-primary">{rad.radical}</span>
                                                                                    {rad.hanviet && <span className="text-xs text-muted-foreground border-l pl-1.5">{rad.hanviet}</span>}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Right Column: Examples Layout using Tabs */}
                                                            <div className="space-y-6">
                                                                <Tabs defaultValue="vn" className="w-full">
                                                                    <TabsList className="w-full grid grid-cols-2">
                                                                        <TabsTrigger value="vn">Vietnamese Words</TabsTrigger>
                                                                        <TabsTrigger value="en">English Words</TabsTrigger>
                                                                    </TabsList>

                                                                    <TabsContent value="vn" className="mt-4">
                                                                        {jdictData?.related_words && jdictData.related_words.length > 0 ? (
                                                                            <div className="grid gap-3">
                                                                                {jdictData.related_words.slice(0, 5).map((ex: any, i: number) => (
                                                                                    <div key={i} className="flex flex-col p-3 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors border border-transparent hover:border-border">
                                                                                        <div className="flex items-baseline gap-2 mb-1">
                                                                                            <span className="font-bold text-lg text-primary font-japanese">{ex.word.replace("する", " する")}</span>
                                                                                            {ex.kana && <span className="text-sm text-muted-foreground font-japanese">{ex.kana}</span>}
                                                                                        </div>
                                                                                        <p className="text-sm">{ex.mean}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center p-6 text-muted-foreground border rounded-md border-dashed">
                                                                                <p className="italic text-sm">No related words found.</p>
                                                                            </div>
                                                                        )}
                                                                    </TabsContent>

                                                                    <TabsContent value="en" className="mt-4">
                                                                        {kanjiAliveData?.examples && kanjiAliveData.examples.length > 0 ? (
                                                                            <div className="grid gap-3">
                                                                                {kanjiAliveData.examples.slice(0, 5).map((ex: any, i: number) => (
                                                                                    <div key={i} className="flex flex-col p-3 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors border border-transparent hover:border-border">
                                                                                        <div className="flex items-baseline gap-2 mb-1">
                                                                                            <span className="font-bold text-lg text-primary font-japanese">{ex.japanese}</span>
                                                                                            {ex.reading && <span className="text-sm text-muted-foreground font-japanese">{ex.reading}</span>}
                                                                                        </div>
                                                                                        <p className="text-sm">{ex.english}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center p-6 text-muted-foreground border rounded-md border-dashed">
                                                                                <p className="italic text-sm">No english examples found.</p>
                                                                            </div>
                                                                        )}
                                                                    </TabsContent>
                                                                </Tabs>
                                                            </div>

                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </SheetContent >
        </Sheet >
    );
}
