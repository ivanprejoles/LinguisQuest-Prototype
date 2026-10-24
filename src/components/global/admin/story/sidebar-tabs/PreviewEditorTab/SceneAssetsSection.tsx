'use client';
import React from 'react';
import { ScenarioNode } from '@/types/novel/scenario';
import { Image, User, Volume2, Music } from 'lucide-react';

interface AssetOption { fileId: string; url: string; name: string; }
interface Props {
  activeNode: ScenarioNode;
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void;
  backgrounds: AssetOption[];
  characters: AssetOption[];
  bgm: AssetOption[];
  sfx: AssetOption[];
}
{/* SECTION 3: STORAGE ASSETS SELECTION MATRIX (CONVERTED TO DROPDOWNS) */}
export default function SceneAssetsSection({ activeNode, onUpdateNode, backgrounds, characters, bgm, sfx }: Props) {
  return (
      <div className="space-y-3 bg-[#05070f]/50 p-3 rounded-lg border border-[#161f38]">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block border-b border-[#161f38] pb-1.5">
          Scene Assets (From Storage Vault)
        </span>
        
        {/* Background Image Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Image className="w-2.5 h-2.5 text-sky-400" /> Background Scene Image
          </label>
          <select
            value={activeNode.bgImage || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { bgImage: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Background / Transparent --</option>
            {backgrounds.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Character Sprite Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <User className="w-2.5 h-2.5 text-emerald-400" /> Character Sprite Asset
          </label>
          <select
            value={activeNode.characterImage || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { characterImage: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Character Sprite Loaded --</option>
            {characters.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* BGM Track Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Music className="w-2.5 h-2.5 text-indigo-400" /> Ambient Background Audio Track
          </label>
          <select
            value={activeNode.bgMusic || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { bgMusic: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- Silence / Mute Music --</option>
            {bgm.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* SFX Action Track Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Volume2 className="w-2.5 h-2.5 text-amber-400" /> Sound Effect (SFX) Action Trigger
          </label>
          <select
            value={activeNode.sfx || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { sfx: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Effect Trigger --</option>
            {sfx.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  );
}
