"use client";

interface RoastDisplayProps {
  roast: string;
}

export default function RoastDisplay({ roast }: RoastDisplayProps) {
  if (!roast) return null;

  return (
    <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl mt-8">
      <div className="flex items-center space-y-2 border-b border-zinc-800 pb-4 mb-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs font-mono text-zinc-500 pl-4">senior_dev_compiler_output.log</span>
      </div>

      {/* Pre-wrap preserves line breaks and spacing flowing from the AI stream */}
      <div className="prose prose-invert max-w-none font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
        {roast}
      </div>
    </div>
  );
}