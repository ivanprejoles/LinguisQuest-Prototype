// src/components/studio/sidebar/StorageTab.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, User, Music, Volume2, Plus, MoreVertical, Edit2, RefreshCw, Trash2, Loader2, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAssetStore } from '@/store/story/useAssetStore';
import { useParams } from 'next/navigation';

interface StorageTabProps {
  sessionId: string;
}

type DialogMode = 'upload_name' | 'rename_meta' | 'swap_file' | 'confirm_delete' | null;

interface DialogConfig {
  mode: DialogMode;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'default' | 'destructive';
  inputValue?: string;
  targetId?: string;       // fileId being processed
  targetFile?: File | null; // staged file payload
  targetType?: string;     // rowType indicator
}

export default function StorageTab({ sessionId }: StorageTabProps) {
  const { languageId } = useParams<{ languageId: string }>();
  
  const {
    assets,
    fetchAssets,
    addAsset,
    updateAssetFile,
    updateAssetName,
    deleteAsset,
    isLoading: isStoreLoading
  } = useAssetStore();

  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null);
  const [activeCategoryUploading, setActiveCategoryUploading] = useState<string | null>(null);

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    mode: null,
    title: '',
    description: '',
    confirmLabel: '',
  });

  const bgRef = useRef<HTMLInputElement>(null);
  const charRef = useRef<HTMLInputElement>(null);
  const bgmRef = useRef<HTMLInputElement>(null);
  const sfxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets(sessionId);
  }, [sessionId, fetchAssets]);

  const backgrounds = assets.filter(a => a.rowType === 'background_image');
  const characters = assets.filter(a => a.rowType === 'character_figure');
  const music = assets.filter(a => a.rowType === 'background_sound');
  const sfx = assets.filter(a => a.rowType === 'sound_effect');

  const closeDialog = () => {
    setDialogConfig({ mode: null, title: '', description: '', confirmLabel: '' });
    if (bgRef.current) bgRef.current.value = '';
    if (charRef.current) charRef.current.value = '';
    if (bgmRef.current) bgmRef.current.value = '';
    if (sfxRef.current) sfxRef.current.value = '';
  };

  const handleDialogConfirm = async () => {
    const { mode, targetId, inputValue, targetFile, targetType } = dialogConfig;
    if (!mode) return;

    if (mode === 'swap_file' && !targetFile) {
      alert("Please select a replacement binary file before confirming.");
      return;
    }

    closeDialog();

    // A. UPLOAD ACTION PIPELINE
    if (mode === 'upload_name' && targetFile && targetType) {
      setActiveCategoryUploading(targetType);
      const cleanName = inputValue?.trim() || targetFile.name;
      const fileWithCustomName = new File([targetFile], cleanName, { type: targetFile.type });
      const success = await addAsset(
        fileWithCustomName, 
        sessionId, 
        targetType, 
        cleanName,
        languageId
      );
      if (!success) alert("Failed to upload asset.");
      setActiveCategoryUploading(null);
    }

    // B. RENAME METADATA PIPELINE
    if (mode === 'rename_meta' && targetId && inputValue?.trim()) {
      setActiveProcessingId(targetId);
      const success = await updateAssetName(targetId, inputValue.trim(), sessionId);
      if (!success) alert("Failed to rename asset.");
      setActiveProcessingId(null);
    }

    // C. SWAP BINARY FILE PIPELINE
    if (mode === 'swap_file' && targetId && targetFile && targetType) {
      setActiveProcessingId(targetId);
      const cleanName = inputValue?.trim() || targetFile.name;
      const customFile = new File([targetFile], cleanName, { type: targetFile.type });
      const success = await updateAssetFile(targetId, customFile, sessionId, targetType);
      if (!success) alert("Failed to replace asset file.");
      setActiveProcessingId(null);
    }

    // D. DELETE PURGE PIPELINE
    if (mode === 'confirm_delete' && targetId) {
      setActiveProcessingId(targetId);
      const success = await deleteAsset(targetId, sessionId);
      if (!success) alert("Failed to delete asset safely.");
      setActiveProcessingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    setDialogConfig({
      mode: 'upload_name',
      title: 'Upload Workspace Asset',
      description: `Provide a target name for this item. Type will be mapped to ${type.replace('_', ' ')}.`,
      confirmLabel: 'Upload Asset',
      inputValue: baseTitle,
      targetFile: file,
      targetType: type
    });
  };

  const renderAssetRow = (
    title: string,
    icon: React.ReactNode,
    type: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
    itemsList: any[]
  ) => {
    const isUploadingInThisCategory = activeCategoryUploading === type;

    return (
      <div className="border border-slate-800/60 bg-slate-900/10 rounded-xl p-3 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            {icon}
            <span>{title}</span>
            <span className="text-[9px] text-slate-600 font-mono">({itemsList.length})</span>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            disabled={activeCategoryUploading !== null}
            onClick={() => inputRef.current?.click()}
            className="w-6 h-6 bg-indigo-600/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-md transition disabled:opacity-50"
          >
            {isUploadingInThisCategory ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </Button>
          
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => handleFileChange(e, type)}
            accept={type.includes('sound') || type.includes('effect') ? "audio/*" : "image/*"}
            className="hidden"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent snap-x">
          {itemsList.length === 0 ? (
            <div className="text-[10px] text-slate-600 italic py-4 w-full text-center border border-dashed border-slate-900 rounded-lg">
              No items in this shelf
            </div>
          ) : (
            itemsList.map((asset) => {
              const isAssetBusy = activeProcessingId === asset.fileId;

              return (
                <div 
                  key={asset.fileId} 
                  className={`w-24 shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-lg p-1.5 flex flex-col gap-1.5 relative group snap-start transition ${
                    isAssetBusy ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="w-full aspect-video bg-slate-900 rounded flex items-center justify-center overflow-hidden border border-slate-800 relative">
                    {(type === 'background_image' || type === 'character_figure') && asset.url ? (
                      <img src={asset.url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-600">
                        {type.includes('sound') ? <Music className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </div>
                    )}

                    {isAssetBusy && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      </div>
                    )}

                    {!isAssetBusy && (
                      <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-5 h-5 flex items-center justify-center bg-slate-950/90 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors focus:outline-none cursor-pointer">
                            <MoreVertical className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          
                          <DropdownMenuContent align="end" className="w-32 bg-slate-950 border-slate-800 text-[11px] text-slate-300">
                            <DropdownMenuItem 
                              onClick={() => setDialogConfig({
                                mode: 'rename_meta',
                                title: 'Rename Target Asset',
                                description: 'Modify the display key used to index this workspace resource.',
                                confirmLabel: 'Apply Title Mutation',
                                inputValue: asset.name,
                                targetId: asset.fileId
                              })} 
                              className="focus:bg-slate-900 focus:text-white gap-1.5 cursor-pointer py-1"
                            >
                              <Edit2 className="w-3 h-3 text-sky-400" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDialogConfig({
                                mode: 'swap_file',
                                title: 'Swap File & Update Name',
                                description: `Upload a replacement file and update metadata for "${asset.name}".`,
                                confirmLabel: 'Apply Changes',
                                targetId: asset.fileId,
                                targetType: type,
                                inputValue: asset.name,
                                targetFile: null
                              })} 
                              className="focus:bg-slate-900 focus:text-white gap-1.5 cursor-pointer py-1"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-400" /> Swap File
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDialogConfig({
                                mode: 'confirm_delete',
                                title: 'Purge Cloud Resource?',
                                description: `Are you absolute sure you want to completely erase "${asset.name}" from Cloud Storage? This process is irreversible.`,
                                confirmLabel: 'Purge Permanently',
                                confirmVariant: 'destructive',
                                targetId: asset.fileId
                              })} 
                              className="focus:bg-rose-950 focus:text-rose-200 gap-1.5 text-rose-400 cursor-pointer py-1 border-t border-slate-900"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setDialogConfig({
                      mode: 'rename_meta',
                      title: 'Rename Target Asset',
                      description: 'Modify the display key used to index this workspace resource.',
                      confirmLabel: 'Apply Title Mutation',
                      inputValue: asset.name,
                      targetId: asset.fileId
                    })}
                    className="w-full text-left text-[9px] font-mono text-slate-400 truncate hover:text-indigo-400 transition-colors focus:outline-none block"
                    title={asset.name}
                  >
                    {asset.name}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (isStoreLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="text-xs">Connecting to MongoDB...</span>
      </div>
    );
  }

  const showInputField = dialogConfig.mode === 'upload_name' || dialogConfig.mode === 'rename_meta' || dialogConfig.mode === 'swap_file';

  return (
    <div className="space-y-4">
      {renderAssetRow("Background Images", <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />, "background_image", bgRef, backgrounds)}
      {renderAssetRow("Character Figures", <User className="w-3.5 h-3.5 text-sky-400" />, "character_figure", charRef, characters)}
      {renderAssetRow("Background Sounds", <Music className="w-3.5 h-3.5 text-emerald-400" />, "background_sound", bgmRef, music)}
      {renderAssetRow("Sound Effects", <Volume2 className="w-3.5 h-3.5 text-amber-400" />, "sound_effect", sfxRef, sfx)}

      {/* --- UNIFIED STATE CONTROLLED SHADCN DIALOG WINDOW --- */}
      <Dialog open={dialogConfig.mode !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[400px] bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight text-slate-200">
              {dialogConfig.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 pt-1">
              {dialogConfig.description}
            </DialogDescription>
          </DialogHeader>

          {showInputField && (
            <div className="py-2 space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Name</label>
                <Input
                  value={dialogConfig.inputValue || ''}
                  onChange={(e) => setDialogConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                  className="bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 text-xs text-slate-200"
                  placeholder="Assign display string..."
                  autoFocus
                />
              </div>

              {/* INTEGRATED FILE FIELD SPECIFICALLY FOR SWAPS */}
              {dialogConfig.mode === 'swap_file' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Replacement Binary File</label>
                  <div className="border border-dashed border-slate-800 rounded-lg p-4 text-center bg-slate-900/40 relative">
                    <input
                      type="file"
                      id="modal-integrated-file-picker"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const isAudio = dialogConfig.targetType?.includes('sound') || dialogConfig.targetType?.includes('effect');
                        if (isAudio && !file.type.startsWith('audio/')) {
                          alert("Invalid Format: This slot strictly requires an audio asset.");
                          e.target.value = '';
                          return;
                        }
                        if (!isAudio && !file.type.startsWith('image/')) {
                          alert("Invalid Format: This slot strictly requires an image asset.");
                          e.target.value = '';
                          return;
                        }

                        const baseTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        setDialogConfig(prev => ({ ...prev, targetFile: file, inputValue: baseTitle }));
                      }}
                      accept={
                        dialogConfig.targetType?.includes('sound') || dialogConfig.targetType?.includes('effect') 
                          ? "audio/*" 
                          : "image/*"
                      }
                    />

                    {dialogConfig.targetFile ? (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ✓ Ready to Swap
                        </span>
                        <span className="text-[11px] text-slate-300 truncate max-w-[280px] font-mono mt-1">
                          {dialogConfig.targetFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDialogConfig(prev => ({ ...prev, targetFile: null }));
                            const input = document.getElementById('modal-integrated-file-picker') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                          className="text-[10px] text-rose-400 hover:underline mt-2 block"
                        >
                          Change Selected File
                        </button>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-xs text-slate-500 mb-2">No replacement file staged</p>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => document.getElementById('modal-integrated-file-picker')?.click()}
                          className="text-[11px] h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          Choose File Binary
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogConfig.mode === 'confirm_delete' && (
            <div className="flex gap-2 bg-rose-950/20 border border-rose-900/40 rounded p-2.5 text-[11px] text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>This completely eliminates dependencies pointing to this record layout inside active canvas contexts.</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button 
              variant="ghost" 
              onClick={closeDialog}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button 
              variant={dialogConfig.confirmVariant || 'default'}
              disabled={
                (showInputField && !dialogConfig.inputValue?.trim()) ||
                (dialogConfig.mode === 'swap_file' && !dialogConfig.targetFile)
              }
              onClick={handleDialogConfirm}
              className={`text-xs ${!dialogConfig.confirmVariant ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : ''}`}
            >
              {dialogConfig.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}