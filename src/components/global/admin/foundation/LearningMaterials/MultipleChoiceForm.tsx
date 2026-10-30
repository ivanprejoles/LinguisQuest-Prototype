
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { MultipleChoicePayload } from "@/types/foundation/materials";

interface OptionItem {
  id: string;
  text: string;
  imageUrl?: string;
  imageFileId?: string;
}

export interface MultipleChoiceFormProps {
  initialData?: Partial<MultipleChoicePayload>;
  onSubmit: (payload: MultipleChoicePayload) => void;
}

export function MultipleChoiceForm({
  initialData,
  onSubmit,
}: MultipleChoiceFormProps) {
  // 1. Initialize state strictly once on mount
  const [question, setQuestion] = useState(
    initialData?.question ?? "Select the correct translation"
  );
  const [correctOptionId, setCorrectOptionId] = useState<string>(
    initialData?.correctAnswer ?? "opt-1"
  );
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [options, setOptions] = useState<OptionItem[]>(() => {
    if (initialData?.options && initialData.options.length > 0) {
      return initialData.options.map((opt) => ({
        id: opt.id,
        text: opt.text ?? "",
        imageUrl: opt.imageUrl || undefined,
        imageFileId: opt.imageFileId || undefined,
      }));
    }
    return [
      { id: "opt-1", text: "" },
      { id: "opt-2", text: "" },
      { id: "opt-3", text: "" },
    ];
  });

  // 2. Direct form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanQuestion = question.trim();
    const cleanedOptions = options.map((opt) => ({
      id: opt.id,
      text: opt.text.trim(),
      imageUrl: opt.imageUrl || null,
      imageFileId: opt.imageFileId || null,
    }));

    const isValid =
      cleanQuestion.length > 0 &&
      cleanedOptions.every((opt) => opt.text.length > 0) &&
      Boolean(correctOptionId);

    const payload: MultipleChoicePayload = {
      type: "multipleChoice",
      question: cleanQuestion,
      options: cleanedOptions,
      correctAnswer: correctOptionId,
      isValid,
    };

    onSubmit(payload);
  };

  // Option count handlers (3 or 4 max)
  const handleOptionCountChange = (count: number) => {
    if (count === 3 && options.length === 4) {
      const updated = options.slice(0, 3);
      setOptions(updated);
      if (correctOptionId === "opt-4") {
        setCorrectOptionId("opt-1");
      }
    } else if (count === 4 && options.length === 3) {
      setOptions([...options, { id: "opt-4", text: "" }]);
    }
  };

  const handleTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  // Upload option image handler
  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIdx(index);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "options");

      const res = await fetch("/api/admin/foundation/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const updated = [...options];
      updated[index].imageUrl = json.url;
      updated[index].imageFileId = json.fileId;
      setOptions(updated);
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...options];
    delete updated[index].imageUrl;
    delete updated[index].imageFileId;
    setOptions(updated);
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl"
    >
      {/* 1. Instruction Header */}
      <div>
        <Label className="text-xs font-black uppercase text-slate-500 mb-1 block">
          Instruction / Question <span className="text-red-500">*</span>
        </Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which of the following means 'Hello'?"
          className="font-bold h-11 rounded-xl bg-white border-2"
        />
      </div>

      {/* 2. Number of Options Selection */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-200 p-3 rounded-2xl">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
          Number of Choice Options
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={options.length === 3 ? "default" : "outline"}
            onClick={() => handleOptionCountChange(3)}
            className={`font-black rounded-xl h-8 px-4 ${
              options.length === 3
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""
            }`}
          >
            3 Options
          </Button>
          <Button
            type="button"
            size="sm"
            variant={options.length === 4 ? "default" : "outline"}
            onClick={() => handleOptionCountChange(4)}
            className={`font-black rounded-xl h-8 px-4 ${
              options.length === 4
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""
            }`}
          >
            4 Options
          </Button>
        </div>
      </div>

      {/* 3. Option Configuration List & Correct Answer Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-black uppercase text-slate-500 block">
          Option Choices & Mark Correct Answer
        </Label>

        <RadioGroup
          value={correctOptionId}
          onValueChange={setCorrectOptionId}
          className="space-y-3"
        >
          {options.map((option, idx) => {
            const isCorrect = correctOptionId === option.id;
            return (
              <div
                key={option.id}
                className={`relative flex flex-col md:flex-row md:items-center gap-3 p-3.5 rounded-2xl border-2 transition-all bg-white ${
                  isCorrect
                    ? "border-green-500 shadow-[0_3px_0_0_#22c55e]"
                    : "border-slate-200"
                }`}
              >
                {/* Radio trigger for correct answer */}
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="w-5 h-5 text-green-600"
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-xs font-black uppercase text-slate-400 cursor-pointer"
                  >
                    Option {idx + 1}
                  </Label>
                </div>

                {/* Text Input */}
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => handleTextChange(idx, e.target.value)}
                    placeholder={`Choice ${idx + 1} text...`}
                    className="font-bold h-10 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Optional Image / Icon Upload */}
                <div className="flex items-center gap-2">
                  {option.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={option.imageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer h-10 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-green-500 flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-green-600 transition-colors">
                      {uploadingIdx === idx ? (
                        <span className="animate-pulse">Uploading...</span>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Add Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(idx, e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  )}
                </div>

                {/* Correct Badge */}
                {isCorrect && (
                  <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                  </span>
                )}
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </form>
  );
}