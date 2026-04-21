import { Handle, Position } from '@xyflow/react';
import { Vocabulary } from '@/lib/types';

export default function KanjiNode({ data, selected }: { data: { vocab: Vocabulary }, selected?: boolean }) {
  const { word, pronunciation, meaning } = data.vocab;

  const borderClass = selected ? "border-emerald-400" : "border-black";
  const shadowClass = selected ? "shadow-[4px_4px_0px_#34d399]" : "shadow-[4px_4px_0px_rgba(0,0,0,1)]";
  const hoverShadowClass = selected ? "hover:shadow-[6px_6px_0px_#34d399]" : "hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]";

  return (
    <div className={`bg-white text-black border-[3px] rounded-sm flex flex-col items-center justify-center p-4 w-[120px] h-[140px] hover:-translate-y-1 transition-all ${borderClass} ${shadowClass} ${hoverShadowClass}`}>
      <Handle type="source" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left" className="opacity-0" />
      <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 mt-[-10px] mr-[-10px] border-2 border-black">
        KANJI
      </div>

      <div className="flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          {pronunciation}
        </span>
        <span className="text-5xl font-black">{word}</span>
        <span className="text-xs font-bold text-center uppercase border-t-2 border-black w-full pt-1 mt-1">
          {meaning}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-black w-3 h-3 !rounded-sm" />
      <Handle type="source" position={Position.Right} className="!bg-black w-3 h-3 !rounded-sm" />
      <Handle type="source" position={Position.Left} className="!bg-black w-3 h-3 !rounded-sm" />
    </div>
  );
}
