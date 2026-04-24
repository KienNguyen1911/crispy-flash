import { memo } from 'react';

function CategoryGroupNode({ data }: { data: { label: string, width: number, height: number } }) {
  return (
    <div 
      className="bg-[#f1f5f9] border-[4px] border-black rounded-sm relative shadow-[8px_8px_0px_#e2e8f0]"
      style={{
        width: data.width,
        height: data.height
      }}
    >
      <div className="absolute -top-[16px] left-[16px] bg-[#3b82f6] text-white font-black px-4 py-1.5 rounded-sm text-sm border-[3px] border-black shadow-[4px_4px_0px_#000] z-10 uppercase tracking-widest pointer-events-auto">
        {data.label}
      </div>
    </div>
  );
}

export default memo(CategoryGroupNode);
