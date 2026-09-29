// "use client";

// import React, { useState } from "react";
// import { Language } from "@prisma/client";
// import { Trash2, Edit, GripVertical } from "lucide-react";
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

// interface LanguagesGridProps {
//   languages: Language[];
//   onSelect: (language: Language) => void;
//   onEdit: (language: Language, e: React.MouseEvent) => void;
//   onDelete: (id: string, e: React.MouseEvent) => void;
//   onDragStart: (index: number) => void;
//   onDrop: (index: number) => void;
// }

// export function LanguagesGrid({
//   languagePath,
//   languages,
//   // onSelect,
//   onEdit,
//   onDelete,
//   onDragStart,
//   onDrop,
// }: LanguagesGridProps) {
//   const [deletingLanguageId, setDeletingLanguageId] = useState<string | null>(null);

//   const handleConfirmDelete = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (deletingLanguageId) {
//       onDelete(deletingLanguageId, e);
//       setDeletingLanguageId(null);
//     }
//   };

//   return (
//     <>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {languages.map((lang, idx) => (
//           <div
//             key={lang.id}
//             draggable
//             onDragStart={() => onDragStart(idx)}
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={() => onDrop(idx)}
//             // onClick={() => onSelect(lang)}
//             className="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-green-500 hover:shadow-md transition cursor-pointer flex items-center justify-between"
//           >
//             <div className="flex items-center gap-3">
//               <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-400 cursor-grab" />

//               <img
//                 src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
//                 alt={lang.name}
//                 className="w-8 h-6 object-cover rounded border border-slate-200"
//               />

//               <div>
//                 <h3 className="font-bold text-slate-800 text-lg">{lang.name}</h3>
//                 <p className="text-xs text-slate-400 font-medium">
//                   {lang.voiceLanguage}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onEdit(lang, e);
//                 }}
//                 className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
//                 title="Edit Language"
//               >
//                 <Edit className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setDeletingLanguageId(lang.id);
//                 }}
//                 className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
//                 title="Delete Language"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Delete Language Confirmation Modal */}
//       <AlertDialog
//         open={Boolean(deletingLanguageId)}
//         onOpenChange={(open) => !open && setDeletingLanguageId(null)}
//       >
//         <AlertDialogContent className="rounded-3xl border-2 border-slate-100 max-w-md">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-xl font-black text-slate-800">
//               Delete Language?
//             </AlertDialogTitle>
//             <AlertDialogDescription className="text-sm font-semibold text-slate-500">
//               Are you sure you want to delete this language? Cascading delete will also remove all associated roadmaps, stage levels, and vocabulary data.
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
//     </>
//   );
// }
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Language } from "@prisma/client";
import { Trash2, Edit, GripVertical } from "lucide-react";
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

interface LanguagesGridProps {
  languagePath: string;
  languages: Language[];
  // onSelect?: (language: Language) => void;
  onEdit: (language: Language, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
}

export function LanguagesGrid({
  languagePath,
  languages,
  // onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDrop,
}: LanguagesGridProps) {
  const [deletingLanguageId, setDeletingLanguageId] = useState<string | null>(
    null
  );

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingLanguageId) {
      onDelete(deletingLanguageId, e);
      setDeletingLanguageId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang, idx) => {
          const href = `${languagePath}/${lang.id}`;

          return (
            <Link
              key={lang.id}
              href={href}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(idx);
              }}
              // onClick={() => {
              //   if (onSelect) onSelect(lang);
              // }}
              className="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-green-500 hover:shadow-md transition cursor-pointer flex items-center justify-between block text-left"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-400 cursor-grab shrink-0" />

                <img
                  src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
                  alt={lang.name}
                  className="w-8 h-6 object-cover rounded border border-slate-200 shrink-0"
                />

                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg truncate">
                    {lang.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {lang.voiceLanguage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(lang, e);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Edit Language"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeletingLanguageId(lang.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete Language"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Delete Language Confirmation Modal */}
      <AlertDialog
        open={Boolean(deletingLanguageId)}
        onOpenChange={(open) => !open && setDeletingLanguageId(null)}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-slate-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">
              Delete Language?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-semibold text-slate-500">
              Are you sure you want to delete this language? Cascading delete
              will also remove all associated roadmaps, stage levels, and
              vocabulary data.
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
    </>
  );
}