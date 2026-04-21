import { Handle, Position } from '@xyflow/react';
import { Vocabulary } from '@/lib/types';

export default function VocabNode({ data }: { data: { vocab: Vocabulary } }) {
  const { word, pronunciation, meaning } = data.vocab;

  return (
    <div className="bg-white text-black border-2 border-black rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col p-3 w-[180px] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all relative">
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />

      <div className="flex flex-col">
        <span className="text-2xl font-bold">{word}</span>
        <span className="text-[11px] text-muted-foreground font-medium mb-1">{pronunciation}</span>
        
        <div className="border-t border-dotted border-gray-400 mt-1 pt-1">
          <span className="text-sm font-semibold text-blue-600 line-clamp-2 leading-tight">
            {meaning}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-black w-2.5 h-2.5 !rounded-sm" />
      <Handle type="source" position={Position.Bottom} className="!bg-black w-2.5 h-2.5 !rounded-sm" />
    </div>
  );
}
