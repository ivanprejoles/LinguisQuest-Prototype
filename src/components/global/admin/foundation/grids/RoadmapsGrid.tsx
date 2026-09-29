// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { ChevronRight, Trash2, Edit, Image as ImageIcon } from "lucide-react";
// import { Roadmap } from "@prisma/client";

// interface RoadmapsGridProps {
//   roadmapPath: string;
//   roadmaps: Roadmap[];
//   onSelect: (roadmap: Roadmap) => void;
//   onEdit: (roadmap: Roadmap, e: React.MouseEvent) => void;
//   onDelete: (id: string, e: React.MouseEvent) => void;
//   onDragStart: (index: number) => void;
//   onDrop: (index: number) => void;
// }

// export function RoadmapsGrid({
//   roadmapPath,
//   roadmaps,
//   onSelect,
//   onEdit,
//   onDelete,
//   onDragStart,
//   onDrop,
// }: RoadmapsGridProps) {
//   const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(null);

//   const handleConfirmDelete = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (deletingRoadmapId) {
//       onDelete(deletingRoadmapId, e);
//       setDeletingRoadmapId(null);
//     }
//   };

//   return (
//     <TooltipProvider delay={200}>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
//         {roadmaps.map((rm, index) => {
//           const cardContent = (
//             <div
//               draggable
//               onDragStart={() => onDragStart(index)}
//               onDragOver={(e) => e.preventDefault()}
//               onDrop={() => onDrop(index)}
//               onClick={() => onSelect(rm)}
//               className="cursor-pointer group relative bg-white border-2 border-slate-300 rounded-2xl transition-all duration-150 shadow-[0_5px_0_0_#cbd5e1] hover:border-green-500 hover:shadow-[0_5px_0_0_#22c55e] active:translate-y-1 active:shadow-none flex flex-col justify-between h-48"
//             >
//               {/* Floating Title Badge on the top border outline */}
//               <div className="absolute -top-3.5 left-4 z-10 bg-white px-3 py-0.5 border-2 border-slate-300 rounded-lg group-hover:border-green-500 max-w-[85%] shadow-sm">
//                 <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">
//                   {rm.title}
//                 </h4>
//               </div>

//               {/* Main Image Container */}
//               <div className="relative w-full h-full bg-slate-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
//                 {rm.imageUrl ? (
//                   <Image
//                     src={rm.imageUrl}
//                     alt={rm.title}
//                     fill
//                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                     className="object-cover transition-transform duration-300 group-hover:scale-105"
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center justify-center text-slate-400 gap-1 pt-2">
//                     <ImageIcon className="w-10 h-10" />
//                     <span className="text-[10px] font-bold uppercase tracking-wider">
//                       No Image
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Compact Bottom Toolbar */}
//               <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
//                 <div className="flex items-center gap-1 text-slate-500 group-hover:text-green-600 font-bold text-[11px] transition-colors">
//                   <span>Manage Stages</span>
//                   <ChevronRight className="w-3.5 h-3.5" />
//                 </div>

//                 <div className="flex items-center gap-0.5 z-10">
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onEdit(rm, e);
//                     }}
//                     title="Edit Roadmap"
//                   >
//                     <Edit className="w-3.5 h-3.5" />
//                   </Button>

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setDeletingRoadmapId(rm.id);
//                     }}
//                     title="Delete Roadmap"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           );

//           // Wrap whole card in Tooltip if description exists
//           if (rm.description) {
//             return (
//               <Tooltip key={rm.id}>
//                 <TooltipTrigger render={cardContent} />
//                 <TooltipContent side="bottom" className="max-w-xs text-xs font-medium">
//                   {rm.description}
//                 </TooltipContent>
//               </Tooltip>
//             );
//           }

//           return <React.Fragment key={rm.id}>{cardContent}</React.Fragment>;
//         })}
//       </div>

//       {/* Delete Roadmap Confirmation Modal */}
//       <AlertDialog
//         open={Boolean(deletingRoadmapId)}
//         onOpenChange={(open) => !open && setDeletingRoadmapId(null)}
//       >
//         <AlertDialogContent className="rounded-3xl border-2 border-slate-100 max-w-md">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-xl font-black text-slate-800">
//               Delete Roadmap?
//             </AlertDialogTitle>
//             <AlertDialogDescription className="text-sm font-semibold text-slate-500">
//               Are you sure you want to delete this roadmap? All nested stage levels and associated media will also be permanently removed.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="gap-2 sm:gap-0">
//             <AlertDialogCancel className="rounded-2xl border-2 border-slate-200 font-bold">
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirmDelete}
//               className="rounded-2xl bg-red-500 hover:bg-red-600 font-black text-white shadow-[0_4px_0_0_#b91c1c]"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </TooltipProvider>
//   );
// }
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, Trash2, Edit, Image as ImageIcon } from "lucide-react";
import { Roadmap } from "@prisma/client";

interface RoadmapsGridProps {
  roadmapPath: string;
  roadmaps: Roadmap[];
  // onSelect: (roadmap: Roadmap) => void;
  onEdit: (roadmap: Roadmap, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
}

export function RoadmapsGrid({
  roadmapPath,
  roadmaps,
  // onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDrop,
}: RoadmapsGridProps) {
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(
    null
  );

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingRoadmapId) {
      onDelete(deletingRoadmapId, e);
      setDeletingRoadmapId(null);
    }
  };

  return (
    <TooltipProvider delay={200}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {roadmaps.map((rm, index) => {
          // Constructs the full path for the roadmap link
          const href = `${roadmapPath}/${rm.id}`;

          const cardContent = (
            <Link
              href={href}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(index);
              }}
              // onClick={(e) => {
              //   // Preserves onSelect callback logic while maintaining Link semantics
              //   onSelect(rm);
              // }}
              className="group relative bg-white border-2 border-slate-300 rounded-2xl transition-all duration-150 shadow-[0_5px_0_0_#cbd5e1] hover:border-green-500 hover:shadow-[0_5px_0_0_#22c55e] active:translate-y-1 active:shadow-none flex flex-col justify-between h-48 block text-left"
            >
              {/* Floating Title Badge on the top border outline */}
              <div className="absolute -top-3.5 left-4 z-10 bg-white px-3 py-0.5 border-2 border-slate-300 rounded-lg group-hover:border-green-500 max-w-[85%] shadow-sm">
                <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">
                  {rm.title}
                </h4>
              </div>

              {/* Main Image Container */}
              <div className="relative w-full h-full bg-slate-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
                {rm.imageUrl ? (
                  <Image
                    src={rm.imageUrl}
                    alt={rm.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-1 pt-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      No Image
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Bottom Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                <div className="flex items-center gap-1 text-slate-500 group-hover:text-green-600 font-bold text-[11px] transition-colors">
                  <span>Manage Stages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-0.5 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(rm, e);
                    }}
                    title="Edit Roadmap"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingRoadmapId(rm.id);
                    }}
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          );

          // Wrap whole card in Tooltip if description exists
          if (rm.description) {
            return (
              <Tooltip key={rm.id}>
                <TooltipTrigger render={cardContent} />
                <TooltipContent
                  side="bottom"
                  className="max-w-xs text-xs font-medium"
                >
                  {rm.description}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={rm.id}>{cardContent}</React.Fragment>;
        })}
      </div>

      {/* Delete Roadmap Confirmation Modal */}
      <AlertDialog
        open={Boolean(deletingRoadmapId)}
        onOpenChange={(open) => !open && setDeletingRoadmapId(null)}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-slate-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">
              Delete Roadmap?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-semibold text-slate-500">
              Are you sure you want to delete this roadmap? All nested stage
              levels and associated media will also be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-2xl border-2 border-slate-200 font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-2xl bg-red-500 hover:bg-red-600 font-black text-white shadow-[0_4px_0_0_#b91c1c]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}