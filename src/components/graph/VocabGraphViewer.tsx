import React, { useCallback, useEffect, useMemo } from 'react';
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
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Vocabulary } from '@/lib/types';
import { buildGraphElements } from '@/lib/graph-utils';
import KanjiNode from './KanjiNode';
import VocabNode from './VocabNode';
import { useMediaQuery } from '@/hooks/use-media-query';

const nodeTypes = {
  kanjiNode: KanjiNode,
  vocabNode: VocabNode,
};

type VocabGraphViewerProps = {
  vocabulary: Vocabulary[];
};

function InnerGraphViewer({ vocabulary }: VocabGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { setCenter, getNode } = useReactFlow();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isUpperCase = (str: string) => str === str.toUpperCase();

  // Extract root kanjis for the directory
  const rootKanjis = useMemo(() => {
    return vocabulary.filter(v => Boolean(v.part_of_speech) && (v.part_of_speech?.toLowerCase() === 'kanji'
      || isUpperCase(v.meaning)));
  }, [vocabulary]);

  useEffect(() => {
    const { nodes: computedNodes, edges: computedEdges } = buildGraphElements(vocabulary, isMobile);

    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [vocabulary, setNodes, setEdges, isMobile]);

  // Zoom into root kanji
  const handleKanjiClick = useCallback((id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const node = getNode(id);
    if (node) {
      // Offset by half node size (approx 180/60, 70) to center it nicely
      setCenter(
        node.position.x + (isMobile ? 180 : 60),
        node.position.y + 70,
        { zoom: isMobile ? 0.8 : 1.2, duration: 800 }
      );
    }

    // Smoothly scroll the clicked sidebar item into the center of the viewport
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [setCenter, getNode, isMobile]);

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-100px)] rounded-md relative bg-zinc-50 overflow-hidden">

      {/* Sidebar Directory */}
      <div className="w-full md:w-[280px] bg-white h-auto md:h-full flex flex-col z-10 shrink-0 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black md:shadow-[4px_0_15px_rgba(0,0,0,0.1)] relative">
        <div className="flex md:flex-1 overflow-x-auto md:overflow-y-auto flex-row md:flex-col p-3 md:p-4 gap-3 md:gap-0 md:space-y-4 bg-slate-50/50">
          {rootKanjis.map(k => (
            <div
              key={k.id}
              onClick={(e) => handleKanjiClick(k.id, e)}
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

      {/* Main Canvas Area */}
      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
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
