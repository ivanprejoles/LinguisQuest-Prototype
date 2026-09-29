"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, Square, Volume2, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  onAudioReady: (file: File | null) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const previewUrl = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], `sentence-audio-${Date.now()}.webm`, { type: "audio/webm" });

        setAudioPreview(previewUrl);
        setRecordedFile(file);
        onAudioReady(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDialogOpen(true);
    } catch {
      alert("Microphone unavailable or permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDialogOpen(false);
    }
  };

  const clearAudio = () => {
    setAudioPreview(null);
    setRecordedFile(null);
    onAudioReady(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {!recordedFile ? (
          <Button
            type="button"
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 px-5 font-bold shadow-[0_4px_0_0_#b91c1c] active:translate-y-1 active:shadow-none flex items-center gap-2"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            Record Audio Prompt
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 p-2 px-3 rounded-2xl border-2 border-slate-200">
            <Volume2 className="w-5 h-5 text-green-600" />
            <audio src={audioPreview!} controls className="h-8 max-w-[200px]" />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={clearAudio}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Recording Status Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xs text-center flex flex-col items-center justify-center p-6 space-y-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">Recording Audio...</DialogTitle>
          </DialogHeader>

          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full animate-ping absolute" />
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white z-10 shadow-lg">
              <Mic className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400">Speak clearly into your microphone.</p>

          <Button
            type="button"
            onClick={stopRecording}
            className="w-full bg-slate-900 hover:bg-black text-white font-black rounded-2xl h-11 shadow-[0_4px_0_0_#0f172a] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4 fill-white" />
            Stop & Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};