import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Vocabulary } from '@/lib/types';
import { buildGraphElements } from '@/lib/graph-utils';
import { aiClassifier } from '@/lib/ai-classifier';
import { Loader2 } from 'lucide-react';
import KanjiNode from './KanjiNode';
import VocabNode from './VocabNode';
import CategoryGroupNode from './CategoryGroupNode';
import { useMediaQuery } from '@/hooks/use-media-query';
import { GraphKanjiDrawer } from './GraphKanjiDrawer';

const nodeTypes = {
  kanjiNode: KanjiNode,
  vocabNode: VocabNode,
  categoryGroupNode: CategoryGroupNode,
};

type VocabGraphViewerProps = {
  vocabulary: Vocabulary[];
  onWordClick?: (word: string) => void;
  showReading?: boolean;
  onToggleReading?: () => void;
  hideReadingToggle?: boolean;
  mobileControls?: React.ReactNode;
};

function InnerGraphViewer({
  vocabulary,
  onWordClick,
  showReading: controlledShowReading,
  onToggleReading,
  hideReadingToggle = false,
  mobileControls,
}: VocabGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isCategorizing, setIsCategorizing] = React.useState(true);
  const [internalShowReading, setInternalShowReading] = useState(
    controlledShowReading ?? true
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { setCenter, getNode } = useReactFlow();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isUpperCase = (str: string) => str === str.toUpperCase();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const showReading = controlledShowReading ?? internalShowReading;

  const handleToggleReading = useCallback(() => {
    if (onToggleReading) {
      onToggleReading();
      return;
    }
    setInternalShowReading((prev) => !prev);
  }, [onToggleReading]);

  // Extract root kanjis for the directory
  const rootKanjis = useMemo(() => {
    return vocabulary.filter(v => Boolean(v.part_of_speech) && (v.part_of_speech?.toLowerCase() === 'kanji'
      || isUpperCase(v.meaning)));
  }, [vocabulary]);

  const categoryGroups = useMemo(() => {
    return nodes.filter(n => n.type === 'categoryGroupNode');
  }, [nodes]);

  useEffect(() => {
    let isCancelled = false;

    const setupGraph = async () => {
      setIsCategorizing(true);

      const isKanjiMatch = (v: Vocabulary) => {
        return Boolean(v.part_of_speech?.toLowerCase() === 'kanji') || (Boolean(v.meaning) && v.meaning === v.meaning?.toUpperCase());
      };

      const kanjis = vocabulary.filter(v => isKanjiMatch(v));
      const vocabs = vocabulary.filter(v => !isKanjiMatch(v));

      const addedVocabs = new Set<string>();
      vocabs.forEach(v => {
        const hasParent = kanjis.some(k => v.word.includes(k.word));
        if (hasParent) addedVocabs.add(v.id);
      });

      const isolatedVocabs = vocabs.filter(v => !addedVocabs.has(v.id));

      let categoryMap = {};
      if (isolatedVocabs.length > 0) {
        categoryMap = await aiClassifier.categorize(isolatedVocabs);
      }

      if (isCancelled) return;

      const { nodes: computedNodes, edges: computedEdges } = buildGraphElements(vocabulary, isMobile, categoryMap);
      const nodesWithReadingFlag = computedNodes.map(node => {
        if (node.type === 'vocabNode') {
          return {
            ...node,
            data: {
              ...node.data,
              showReading,
            },
          };
        }
        return node;
      });

      setNodes(nodesWithReadingFlag);
      setEdges(computedEdges);
      setIsCategorizing(false);
    };

    setupGraph();

    return () => {
      isCancelled = true;
    };
  }, [vocabulary, setNodes, setEdges, isMobile]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Zoom into root kanji
  const handleKanjiClick = useCallback((k: Vocabulary, e: React.MouseEvent<HTMLDivElement>) => {
    const node = getNode(k.id);
    if (node) {
      // Offset by half node size (approx 180/60, 70) to center it nicely
      setCenter(
        node.position.x + (isMobile ? 180 : 60),
        node.position.y + 70,
        { zoom: isMobile ? 0.8 : 1.2, duration: 800 }
      );
    }

    // Smoothly scroll the clicked sidebar item into the center of the viewport
    if (e.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [setCenter, getNode, isMobile]);

  // Zoom into category group
  const handleGroupClick = useCallback((id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const node = getNode(id);
    if (node) {
      const boxWidth = (node.data.width as number) || 400;
      const boxHeight = (node.data.height as number) || 400;

      setCenter(
        node.position.x + boxWidth / 2,
        node.position.y + boxHeight / 2,
        { zoom: isMobile ? 0.4 : 0.9, duration: 800 }
      );
    }

    if (e.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [setCenter, getNode, isMobile]);

  const playVocabularyText = useCallback((text: string) => {
    if (!text) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=ja`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch((error) => {
      console.error('TTS playback failed:', error);
    });
  }, []);

  useEffect(() => {
    setNodes(currentNodes => currentNodes.map(node => {
      if (node.type !== 'vocabNode') return node;
      return {
        ...node,
        data: {
          ...node.data,
          showReading,
        },
      };
    }));
  }, [showReading, setNodes]);

  // Handle clicking on nodes in the graph canvas
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // React Flow's onNodeClick only triggers for true clicks/taps, 
    // it automatically ignores drag/pan events!
    if (node.type === 'vocabNode') {
      const vocab = node.data.vocab as Vocabulary;
      const textToPlay = vocab.word || vocab.pronunciation || '';
      playVocabularyText(textToPlay);
      
      // Also open Kanji Drawer if requested
      setSelectedWord(vocab.word);
      if (onWordClick) {
        onWordClick(vocab.word);
      }
    } else if (node.type === 'kanjiNode') {
      const vocab = node.data.vocab as Vocabulary;
      setSelectedWord(vocab.word);
      if (onWordClick) {
        onWordClick(vocab.word);
      }
    }
  }, [playVocabularyText, onWordClick]);

  return (
    <div className="flex flex-col md:flex-row w-full h-full rounded-md relative bg-zinc-50 overflow-hidden">

      {/* Sidebar Directory */}
      {(rootKanjis.length > 0 || categoryGroups.length > 0) && (
        <div className="w-full md:w-[280px] bg-white h-auto md:h-full flex flex-col z-10 shrink-0 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black md:shadow-[4px_0_15px_rgba(0,0,0,0.1)] relative">
          <div className="flex flex-col flex-1 overflow-x-auto md:overflow-y-auto p-3 md:p-4 bg-slate-50/50">

            {// Sidebar Directory Row - keep kanji roots and AI category chips on one mobile line
            }
            {(rootKanjis.length > 0 || categoryGroups.length > 0) && (
              <div className="flex flex-row md:flex-col gap-3 md:gap-6 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {rootKanjis.length > 0 && (
                  <div className={categoryGroups.length > 0 ? "md:mb-6" : ""}>
                    <h4 className="text-xs font-black text-gray-500 mb-3 px-1 uppercase tracking-widest hidden md:block">Nhóm Kanji</h4>
                    <div className="flex flex-row md:flex-col gap-3 md:gap-4 flex-nowrap overflow-x-auto md:overflow-visible">
                      {rootKanjis.map(k => (
                        <div
                          key={k.id}
                          onClick={(e) => handleKanjiClick(k, e)}
                          className="bg-white text-black border-[3px] border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex justify-between items-start rounded-sm min-w-[220px] md:min-w-0 flex-shrink-0"
                        >
                          <div className="px-3 py-2 flex flex-col justify-between h-full min-h-[70px]">
                            <div className="text-3xl font-black">{k.word}</div>
                            <div className="text-[11px] text-gray-600 uppercase font-bold tracking-wider pt-2">{k.meaning}</div>
                          </div>
                          <div className="px-2 py-1 mt-2 mr-2 bg-black text-white text-[10px] font-bold rounded-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">
                            {k.pronunciation || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {categoryGroups.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-blue-600 mb-3 px-1 uppercase tracking-widest hidden md:block">Nhóm Từ Vựng AI</h4>
                    <div className="flex flex-row md:flex-col gap-3 md:gap-4 flex-nowrap md:overflow-visible">
                      {categoryGroups.map(group => (
                        <div
                          key={group.id}
                          onClick={(e) => handleGroupClick(group.id, e)}
                          className="bg-[#bfdbfe] text-black border-[3px] border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm min-w-[180px] md:min-w-0 flex-shrink-0 p-3 min-h-[82px] flex items-center justify-center"
                        >
                          <div className="font-black text-[13px] leading-tight break-words whitespace-normal uppercase tracking-wider text-center">
                            {group.data.label as string}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative w-full h-full">
        {mobileControls && (
          <Panel position="top-right" className="m-4 z-40">
            {mobileControls}
          </Panel>
        )}
        {!hideReadingToggle && (
          <div className={`absolute top-4 z-30 ${isMobile ? 'right-4' : 'left-4'}`}>
            <button
              type="button"
              onClick={handleToggleReading}
              className="bg-white text-black border-[3px] border-black rounded-sm px-3 py-2 text-xs font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              {showReading ? 'Reading: ON' : 'Reading: OFF'}
            </button>
          </div>
        )}
        {isCategorizing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">AI đang phân loại từ vựng...</h3>
            <p className="text-sm text-gray-500 mt-2">Vui lòng đợi vài giây</p>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          className="touchdevice-flow"
          nodesConnectable={false}
        >
          {!isMobile && (
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === 'kanjiNode') return '#000';
                return '#3b82f6';
              }}
              nodeColor={(n) => {
                if (n.type === 'kanjiNode') return '#000';
                return '#fff';
              }}
            />
          )}
          <Controls className="bg-white border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] [&_button]:bg-white [&_button]:border-b-[3px] [&_button]:border-black [&_button:last-child]:border-b-0 [&_button_svg]:fill-black [&_button_svg]:stroke-black [&_button_svg]:text-black" />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        <GraphKanjiDrawer 
          word={selectedWord}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      </div>
    </div>
  );
}

export default function VocabGraphViewer(props: VocabGraphViewerProps) {
  return (
    <ReactFlowProvider>
      <InnerGraphViewer {...props} />
    </ReactFlowProvider>
  );
}
