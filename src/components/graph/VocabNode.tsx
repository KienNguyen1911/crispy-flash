import { Handle, Position } from '@xyflow/react';
import { Vocabulary } from '@/lib/types';

export default function VocabNode({ data, selected }: { data: { vocab: Vocabulary }, selected?: boolean }) {
  const { word, pronunciation, meaning } = data.vocab;

  const borderClass = selected ? "border-blue-500" : "border-black";
  const shadowClass = selected ? "shadow-[3px_3px_0px_#3b82f6]" : "shadow-[3px_3px_0px_rgba(0,0,0,1)]";
  const hoverShadowClass = selected ? "hover:shadow-[5px_5px_0px_#3b82f6]" : "hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]";

  return (
    <div className={`bg-white text-black border-2 rounded-sm flex flex-col p-3 w-[180px] hover:-translate-y-0.5 transition-all relative ${borderClass} ${shadowClass} ${hoverShadowClass}`}>
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />

      {/* Visually explicitly identify this as a related word! */}
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 mt-[-10px] mr-[-10px] border-2 border-black">
        VOCAB
      </div>

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
