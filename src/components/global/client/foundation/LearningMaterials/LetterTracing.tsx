// "use client";

// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { LetterTracingPayload } from "@/types/foundation/materials";
// import { TracingEngine, TracingMetrics } from "@/lib/foundation/tracingEngine";
// import { RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

// interface LetterTracingProps {
//   payload: LetterTracingPayload;
//   onAnswerChange: (isCorrect: boolean) => void;
//   disabled?: boolean;
// }

// export function LetterTracing({
//   payload,
//   onAnswerChange,
//   disabled = false,
// }: LetterTracingProps) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const engineRef = useRef<TracingEngine | null>(null);
//   const isDrawingRef = useRef(false);
//   const lastPosRef = useRef<{ x: number; y: number } | null>(null);

//   const [metrics, setMetrics] = useState<TracingMetrics>({
//     validHits: 0,
//     outOfBoundsHits: 0,
//     totalDrawn: 0,
//     accuracy: 0,
//     coverage: 0,
//     isPassed: false,
//     isFailed: false,
//   });

//   const targetLetter = payload?.targetLetter || "A";

//   // Initialize tracing engine
//   const initEngine = useCallback(() => {
//     if (!canvasRef.current) return;
//     engineRef.current = new TracingEngine(canvasRef.current, 280, 280);
//     engineRef.current.prepareGlyph(targetLetter);
//     const initialMetrics = engineRef.current.getMetrics();
//     setMetrics(initialMetrics);
//     onAnswerChange(initialMetrics.isPassed);
//   }, [targetLetter, onAnswerChange]);

//   useEffect(() => {
//     initEngine();
//   }, [initEngine]);

//   const handleReset = () => {
//     if (disabled) return;
//     if (engineRef.current) {
//       engineRef.current.resetCanvas(targetLetter);
//       const resettedMetrics = engineRef.current.getMetrics();
//       setMetrics(resettedMetrics);
//       onAnswerChange(false);
//     }
//   };
  
//   const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
//     if (disabled || !engineRef.current) return;

//     isDrawingRef.current = true;

//     const coords = engineRef.current.getCoordinates(e);
//     lastPosRef.current = coords;

//     // Record the initial point on both the visible canvas
//     // and the transparent coverage-tracking canvas.
//     engineRef.current.drawStrokeSegment(
//       coords.x,
//       coords.y,
//       coords.x,
//       coords.y,
//       "#22c55e"
//     );

//     const currentMetrics = engineRef.current.verifyCoordinate(
//       coords.x,
//       coords.y
//     );

//     setMetrics(currentMetrics);
//     onAnswerChange(currentMetrics.isPassed);
//   };
  
//   const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
//     if (
//       disabled ||
//       !isDrawingRef.current ||
//       !engineRef.current ||
//       !lastPosRef.current
//     ) {
//       return;
//     }

//     const currentCoords = engineRef.current.getCoordinates(e);

//     const strokeColor = metrics.isFailed
//       ? "#ef4444"
//       : "#22c55e";

//     // Draw the complete segment on both canvases.
//     engineRef.current.drawStrokeSegment(
//       lastPosRef.current.x,
//       lastPosRef.current.y,
//       currentCoords.x,
//       currentCoords.y,
//       strokeColor
//     );

//     lastPosRef.current = currentCoords;

//     // Recalculate accuracy and coverage from the drawn stroke.
//     const updatedMetrics = engineRef.current.verifyCoordinate(
//       currentCoords.x,
//       currentCoords.y
//     );

//     setMetrics(updatedMetrics);
//     onAnswerChange(updatedMetrics.isPassed);
//   };


//   const handleEnd = () => {
//     isDrawingRef.current = false;
//     lastPosRef.current = null;
//   };

//   return (
//     <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-5 select-none">
//       {/* Question Header */}
//       <h2 className="text-xl font-black text-white text-center leading-snug">
//         {payload?.question || `Trace the letter "${targetLetter}" carefully`}
//       </h2>

//       {/* Tracing Canvas Box */}
//       <div className="relative bg-white border-2 border-slate-200 rounded-3xl p-3 shadow-[0_4px_0_0_#e2e8f0] flex flex-col items-center gap-3">
//         <div className="relative touch-none border-2 border-slate-100 rounded-2xl bg-white overflow-hidden">
//           <canvas
//             ref={canvasRef}
//             width={280}
//             height={280}
//             onMouseDown={handleStart}
//             onMouseMove={handleMove}
//             onMouseUp={handleEnd}
//             onMouseLeave={handleEnd}
//             onTouchStart={handleStart}
//             onTouchMove={handleMove}
//             onTouchEnd={handleEnd}
//             className={`block ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
//           />

//           {/* Reset Action Button */}
//           <button
//             type="button"
//             disabled={disabled}
//             onClick={handleReset}
//             className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             <RotateCcw className="w-4 h-4 stroke-[2.5]" />
//           </button>
//         </div>

//         {/* Real-time Performance Metrics Badge */}
//         <div className="flex items-center gap-3 text-xs font-black bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-slate-600">
//           <span>
//             Coverage: <strong className="text-sky-600">{metrics.coverage}%</strong>
//           </span>
//           <span className="w-1 h-1 rounded-full bg-slate-300" />
//           <span>
//             Accuracy: <strong className="text-purple-600">{metrics.accuracy}%</strong>
//           </span>

//           {metrics.isPassed && (
//             <span className="text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 ml-1">
//               <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> Trace Complete
//             </span>
//           )}
//           {metrics.isFailed && (
//             <span className="text-rose-700 flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 ml-1">
//               <AlertCircle className="w-3.5 h-3.5 stroke-[3]" /> Off Line
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { LetterTracingPayload } from "@/types/foundation/materials";
import { TracingEngine, TracingMetrics } from "@/lib/foundation/tracingEngine";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Sparkles,
} from "lucide-react";

interface LetterTracingProps {
  payload: LetterTracingPayload;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function LetterTracing({
  payload,
  onAnswerChange,
  disabled = false,
}: LetterTracingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TracingEngine | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [metrics, setMetrics] = useState<TracingMetrics>({
    validHits: 0,
    outOfBoundsHits: 0,
    totalDrawn: 0,
    accuracy: 0,
    coverage: 0,
    isPassed: false,
    isFailed: false,
  });

  const targetLetter = payload?.targetLetter || "A";

  // Initialize tracing engine
  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;

    engineRef.current = new TracingEngine(canvasRef.current, 280, 280);
    engineRef.current.prepareGlyph(targetLetter);

    const initialMetrics = engineRef.current.getMetrics();
    setMetrics(initialMetrics);
    onAnswerChange(initialMetrics.isPassed);
  }, [targetLetter, onAnswerChange]);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  const handleReset = () => {
    if (disabled) return;

    if (engineRef.current) {
      engineRef.current.resetCanvas(targetLetter);
      const resettedMetrics = engineRef.current.getMetrics();
      setMetrics(resettedMetrics);
      onAnswerChange(false);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !engineRef.current) return;

    isDrawingRef.current = true;

    const coords = engineRef.current.getCoordinates(e);
    lastPosRef.current = coords;

    engineRef.current.drawStrokeSegment(
      coords.x,
      coords.y,
      coords.x,
      coords.y,
      "#22c55e"
    );

    const currentMetrics = engineRef.current.verifyCoordinate(
      coords.x,
      coords.y
    );

    setMetrics(currentMetrics);
    onAnswerChange(currentMetrics.isPassed);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (
      disabled ||
      !isDrawingRef.current ||
      !engineRef.current ||
      !lastPosRef.current
    ) {
      return;
    }

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
    onAnswerChange(updatedMetrics.isPassed);
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };


return (
  <div className="mx-auto flex w-full max-w-xl select-none flex-col items-center gap-1.5">

    {/* Compact Header */}
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1">
        <Pencil className="h-3.5 w-3.5 text-cyan-600" />
        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">
          Trace the Letter
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={handleReset}
        className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-[0_2px_0_#e2e8f0] transition-all hover:border-cyan-300 hover:text-cyan-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>

    {/* Compact Question */}
    <h2 className="w-full px-1 text-center text-sm font-black leading-tight text-white sm:text-base">
      {payload?.question || `Trace the letter "${targetLetter}" carefully`}
    </h2>

    {/* Tracing Canvas */}
    <div className="flex w-full flex-col items-center gap-1.5">
      <div className="relative w-full max-w-[280px] overflow-hidden rounded-xl border-2 border-cyan-100 bg-white shadow-[0_3px_0_#e2e8f0]">
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
          onTouchCancel={handleEnd}
          className={`block h-auto w-full touch-none ${
            disabled ? "cursor-not-allowed" : "cursor-crosshair"
          }`}
        />
      </div>

      {/* Compact Metrics */}
      <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
        <span className="rounded-lg border border-cyan-100 bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">
          Coverage: {metrics.coverage}%
        </span>

        <span className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
          Accuracy: {metrics.accuracy}%
        </span>

        {metrics.isPassed && (
          <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Great job!
          </span>
        )}

        {metrics.isFailed && (
          <span className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-700">
            <AlertCircle className="h-3 w-3" />
            Try again!
          </span>
        )}
      </div>
    </div>
  </div>
);

}