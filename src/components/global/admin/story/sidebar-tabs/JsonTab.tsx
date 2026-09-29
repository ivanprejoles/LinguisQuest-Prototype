'use client';
import React from 'react';
import { GraphState } from '@/types/novel/scenario';

interface JsonTabProps {
  nodes: GraphState;
}

export default function JsonTab({ nodes }: JsonTabProps) {
  return (
    <div className="space-y-2 h-full flex flex-col">
      <textarea
        readOnly
        value={JSON.stringify({ nodes }, null, 2)}
        className="w-full flex-1 min-h-[350px] bg-slate-950 font-mono text-[9px] p-2.5 text-emerald-400 border border-slate-800 rounded-lg resize-none focus:outline-none"
      />
    </div>
  );
}