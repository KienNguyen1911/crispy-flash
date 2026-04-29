import { Handle, Position } from '@xyflow/react';
import { Vocabulary } from '@/lib/types';

export default function VocabNode({ data, selected }: { data: { vocab: Vocabulary }, selected?: boolean }) {
  const { word, pronunciation, meaning } = data.vocab;

  const borderClass = selected ? "border-blue-500" : "border-black";
  const shadowClass = selected ? "shadow-[4px_4px_0px_#3b82f6]" : "shadow-[4px_4px_0px_rgba(0,0,0,1)]";
  const hoverShadowClass = selected ? "hover:shadow-[6px_6px_0px_#3b82f6]" : "hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]";

  return (
    <div className={`bg-white text-black border-[3px] rounded-sm flex flex-col p-3 min-w-[180px] max-w-[320px] hover:-translate-y-1 transition-all relative ${borderClass} ${shadowClass} ${hoverShadowClass}`}>
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />

      {/* Visually explicitly identify this as a related word! */}
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 mt-[-10px] mr-[-10px] border-[3px] border-black">
        VOCAB
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-bold break-words">{word}</span>
        {/* <span className="text-[11px] text-muted-foreground font-medium mb-1 break-words">{pronunciation}</span> */}

        <div className="border-t border-dotted border-gray-400 mt-1 pt-1">
          <span className="text-sm font-semibold text-blue-600 leading-tight break-words">
            {meaning}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-black w-2.5 h-2.5 !rounded-sm" />
      <Handle type="source" position={Position.Bottom} className="!bg-black w-2.5 h-2.5 !rounded-sm" />
    </div>
  );
}
