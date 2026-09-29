// "use client";

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
// import { TracingEngine, TracingMetrics } from "@/lib/foundation/tracingEngine";
// import { LetterTracingPayload } from "@/types/foundation/materials";

// interface LetterTracingFormProps {
//   initialData?: Partial<LetterTracingPayload>;
//   onChange: (payload: LetterTracingPayload) => void;
// }

// export function LetterTracingForm({
//   initialData,
//   onChange,
// }: LetterTracingFormProps) {
//   // 1. Initialize state strictly once on mount
//   const [targetLetter, setTargetLetter] = useState(
//     initialData?.targetLetter ?? "A"
//   );
//   const [instruction, setInstruction] = useState(
//     initialData?.question ?? "Trace the letter carefully inside the guideline"
//   );

//   const [metrics, setMetrics] = useState<TracingMetrics>({
//     validHits: 0,
//     outOfBoundsHits: 0,
//     totalDrawn: 0,
//     accuracy: 0,
//     coverage: 0,
//     isPassed: false,
//     isFailed: false,
//   });

//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const engineRef = useRef<TracingEngine | null>(null);
//   const isDrawingRef = useRef(false);
//   const lastPosRef = useRef<{ x: number; y: number } | null>(null);

//   // Stabilize onChange ref to prevent parent re-renders from causing render loops
//   const onChangeRef = useRef(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   // 2. Sync state payload back to parent StageModal
//   useEffect(() => {
//     const cleanLetter = targetLetter.trim();
//     const cleanInstruction = instruction.trim();

//     const payload: LetterTracingPayload = {
//       type: "tracing",
//       targetLetter: cleanLetter || "A",
//       question: cleanInstruction,
//       isValid: cleanLetter.length > 0 && cleanInstruction.length > 0,
//     };

//     onChangeRef.current(payload);
//   }, [targetLetter, instruction]);

//   // Initialize shared tracing engine
//   const initEngine = useCallback(() => {
//     if (!canvasRef.current) return;
//     engineRef.current = new TracingEngine(canvasRef.current, 280, 280);
//     engineRef.current.prepareGlyph(targetLetter);
//     setMetrics(engineRef.current.getMetrics());
//   }, [targetLetter]);

//   useEffect(() => {
//     initEngine();
//   }, [initEngine]);

//   const handleReset = () => {
//     if (engineRef.current) {
//       engineRef.current.resetCanvas(targetLetter.trim() || "A");
//       setMetrics(engineRef.current.getMetrics());
//     }
//   };

//   // Touch & Mouse Handlers
//   const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!engineRef.current) return;
//     isDrawingRef.current = true;

//     const coords = engineRef.current.getCoordinates(e);
//     lastPosRef.current = coords;

//     const currentMetrics = engineRef.current.verifyCoordinate(
//       coords.x,
//       coords.y
//     );
//     setMetrics(currentMetrics);
//   };

//   const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!isDrawingRef.current || !engineRef.current || !lastPosRef.current)
//       return;

//     const currentCoords = engineRef.current.getCoordinates(e);
//     const strokeColor = metrics.isFailed ? "#ef4444" : "#22c55e";

//     engineRef.current.drawStrokeSegment(
//       lastPosRef.current.x,
//       lastPosRef.current.y,
//       currentCoords.x,
//     currentCoords.y,
//       strokeColor
//     );

//     lastPosRef.current = currentCoords;
//     const updatedMetrics = engineRef.current.verifyCoordinate(
//       currentCoords.x,
//       currentCoords.y
//     );
//     setMetrics(updatedMetrics);
//   };

//   const handleEnd = () => {
//     isDrawingRef.current = false;
//     lastPosRef.current = null;
//   };

//   return (
//     <div className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
//       {/* Configuration Inputs */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//         <div>
//           <label className="text-xs font-black uppercase text-slate-500 mb-1 block">
//             Target Letter / Symbol <span className="text-red-500">*</span>
//           </label>
//           <Input
//             value={targetLetter}
//             maxLength={2}
//             onChange={(e) => setTargetLetter(e.target.value)}
//             className="font-black text-center text-lg h-11 rounded-xl bg-white border-2"
//             placeholder="A"
//           />
//         </div>
//         <div className="md:col-span-2">
//           <label className="text-xs font-black uppercase text-slate-500 mb-1 block">
//             Instruction Prompt <span className="text-red-500">*</span>
//           </label>
//           <Input
//             value={instruction}
//             onChange={(e) => setInstruction(e.target.value)}
//             className="font-bold h-11 rounded-xl bg-white border-2"
//             placeholder="Trace the letter..."
//           />
//         </div>
//       </div>

//       {/* Interactive Admin Sandbox */}
//       <div className="flex flex-col items-center justify-center pt-2">
//         <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
//           <Sparkles className="w-3.5 h-3.5 text-green-500" /> Reusable Engine Test Sandbox
//         </span>

//         <div className="relative w-[280px] h-[280px] bg-white border-4 border-slate-200 rounded-3xl shadow-inner overflow-hidden select-none touch-none">
//           <canvas
//             ref={canvasRef}
//             onMouseDown={handleStart}
//             onMouseMove={handleMove}
//             onMouseUp={handleEnd}
//             onMouseLeave={handleEnd}
//             onTouchStart={handleStart}
//             onTouchMove={handleMove}
//             onTouchEnd={handleEnd}
//             className="cursor-crosshair absolute top-0 left-0"
//           />
//         </div>

//         {/* Live Metrics */}
//         <div className="flex items-center gap-4 mt-3">
//           <div className="text-center">
//             <span className="text-[10px] font-bold uppercase text-slate-400 block">
//               Accuracy
//             </span>
//             <span
//               className={`font-black text-sm ${
//                 metrics.accuracy >= 65 ? "text-green-600" : "text-slate-700"
//               }`}
//             >
//               {metrics.accuracy}%
//             </span>
//           </div>
//           <div className="h-6 w-[2px] bg-slate-200" />
//           <div className="text-center">
//             <span className="text-[10px] font-bold uppercase text-slate-400 block">
//               Coverage
//             </span>
//             <span
//               className={`font-black text-sm ${
//                 metrics.coverage >= 70 ? "text-green-600" : "text-slate-700"
//               }`}
//             >
//               {metrics.coverage}%
//             </span>
//           </div>
//           <div className="h-6 w-[2px] bg-slate-200" />
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={handleReset}
//             className="h-8 rounded-xl font-bold text-xs gap-1"
//           >
//             <RefreshCw className="w-3 h-3" /> Reset
//           </Button>
//         </div>

//         {/* Real-time Status */}
//         {metrics.isPassed && (
//           <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
//             <CheckCircle2 className="w-4 h-4" /> Perfect Trace Detected!
//           </div>
//         )}
//         {metrics.isFailed && !metrics.isPassed && (
//           <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
//             <AlertCircle className="w-4 h-4" /> Out-of-bounds detected.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { TracingEngine, TracingMetrics } from "@/lib/foundation/tracingEngine";
import { LetterTracingPayload } from "@/types/foundation/materials";

interface LetterTracingFormProps {
  initialData?: Partial<LetterTracingPayload> | null;
  onSubmit: (payload: LetterTracingPayload) => void;
}

export function LetterTracingForm({
  initialData,
  onSubmit,
}: LetterTracingFormProps) {
  // 1. Initialize state strictly once on mount
  const [targetLetter, setTargetLetter] = useState(
    initialData?.targetLetter ?? "A"
  );
  const [instruction, setInstruction] = useState(
    initialData?.question ?? "Trace the letter carefully inside the guideline"
  );

  const [metrics, setMetrics] = useState<TracingMetrics>({
    validHits: 0,
    outOfBoundsHits: 0,
    totalDrawn: 0,
    accuracy: 0,
    coverage: 0,
    isPassed: false,
    isFailed: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TracingEngine | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // 2. Direct form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanLetter = targetLetter.trim();
    const cleanInstruction = instruction.trim();

    const payload: LetterTracingPayload = {
      type: "tracing",
      targetLetter: cleanLetter || "A",
      question: cleanInstruction,
      isValid: cleanLetter.length > 0 && cleanInstruction.length > 0,
    };

    onSubmit(payload);
  };

  // Initialize shared tracing engine
  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;
    engineRef.current = new TracingEngine(canvasRef.current, 280, 280);
    engineRef.current.prepareGlyph(targetLetter);
    setMetrics(engineRef.current.getMetrics());
  }, [targetLetter]);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.resetCanvas(targetLetter.trim() || "A");
      setMetrics(engineRef.current.getMetrics());
    }
  };

  // Touch & Mouse Handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!engineRef.current) return;
    isDrawingRef.current = true;

    const coords = engineRef.current.getCoordinates(e);
    lastPosRef.current = coords;

    const currentMetrics = engineRef.current.verifyCoordinate(
      coords.x,
      coords.y
    );
    setMetrics(currentMetrics);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !engineRef.current || !lastPosRef.current)
      return;

    const currentCoords = engineRef.current.getCoordinates(e);
    const strokeColor = metrics.isFailed ? "#ef4444" : "#22c55e";

    engineRef.current.drawStrokeSegment(
      lastPosRef.current.x,
      lastPosRef.current.y,
      currentCoords.x,
      currentCoords.y,
      strokeColor
    );

    lastPosRef.current = currentCoords;
    const updatedMetrics = engineRef.current.verifyCoordinate(
      currentCoords.x,
      currentCoords.y
    );
    setMetrics(updatedMetrics);
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl"
    >
      {/* Configuration Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-black uppercase text-slate-500 mb-1 block">
            Target Letter / Symbol <span className="text-red-500">*</span>
          </label>
          <Input
            value={targetLetter}
            maxLength={2}
            onChange={(e) => setTargetLetter(e.target.value)}
            className="font-black text-center text-lg h-11 rounded-xl bg-white border-2"
            placeholder="A"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-black uppercase text-slate-500 mb-1 block">
            Instruction Prompt <span className="text-red-500">*</span>
          </label>
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="font-bold h-11 rounded-xl bg-white border-2"
            placeholder="Trace the letter..."
          />
        </div>
      </div>

      {/* Interactive Admin Preview Canvas */}
      <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Tracing Canvas Preview
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs font-black rounded-xl border-slate-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative touch-none border-2 border-slate-200 rounded-2xl bg-white shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className="cursor-crosshair block"
            />
          </div>

          {/* Real-time Metrics Badge */}
          <div className="flex items-center gap-3 text-xs font-black bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
            <span>
              Coverage:{" "}
              <strong className="text-blue-600">{metrics.coverage}%</strong>
            </span>
            <span>
              Accuracy:{" "}
              <strong className="text-purple-600">{metrics.accuracy}%</strong>
            </span>
            {metrics.isPassed && (
              <span className="text-green-600 flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-lg border border-green-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
            )}
            {metrics.isFailed && (
              <span className="text-red-600 flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-lg border border-red-300">
                <AlertCircle className="w-3.5 h-3.5" /> Failed
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}