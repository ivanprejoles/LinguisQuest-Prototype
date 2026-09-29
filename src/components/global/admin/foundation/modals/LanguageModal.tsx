"use client";

import React, { useState, useEffect } from "react";
import { Language } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageToEdit?: Language | null;
}

const SUPPORTED_LANGUAGES = [
  { name: "Spanish", countryCode: "es", voiceLanguage: "es-ES", flagUrl: "https://flagcdn.com/w80/es.png" },
  { name: "French", countryCode: "fr", voiceLanguage: "fr-FR", flagUrl: "https://flagcdn.com/w80/fr.png" },
  { name: "Tagalog", countryCode: "ph", voiceLanguage: "tl-PH", flagUrl: "https://flagcdn.com/w80/ph.png" },
] as const;

export function LanguageModal({
  isOpen,
  onClose,
  languageToEdit,
}: LanguageModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(languageToEdit);

  const [selectedLangName, setSelectedLangName] = useState<string>(SUPPORTED_LANGUAGES[0].name);
  const [customName, setCustomName] = useState<string>(SUPPORTED_LANGUAGES[0].name);
  const [countryCode, setCountryCode] = useState<string>(SUPPORTED_LANGUAGES[0].countryCode);
  const [voiceLanguage, setVoiceLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].voiceLanguage);

  // Synchronize modal state on opening or target language change
  useEffect(() => {
    if (!isOpen) return;

    if (languageToEdit) {
      setCustomName(languageToEdit.name);
      setCountryCode(languageToEdit.countryCode);
      setVoiceLanguage(languageToEdit.voiceLanguage);

      const matchedPreset = SUPPORTED_LANGUAGES.find(
        (l) => l.countryCode.toLowerCase() === languageToEdit.countryCode.toLowerCase()
      );
      setSelectedLangName(matchedPreset ? matchedPreset.name : "");
    } else {
      const defaultPreset = SUPPORTED_LANGUAGES[0];
      setSelectedLangName(defaultPreset.name);
      setCustomName(defaultPreset.name);
      setCountryCode(defaultPreset.countryCode);
      setVoiceLanguage(defaultPreset.voiceLanguage);
    }
  }, [isOpen, languageToEdit]);

  // Handle Preset Dropdown Changes
  const handlePresetChange = (name: string | null) => {
    if (!name) {
      const defaultPreset = SUPPORTED_LANGUAGES[0];
      setSelectedLangName(defaultPreset.name);
      setCustomName(defaultPreset.name);
      setCountryCode(defaultPreset.countryCode);
      setVoiceLanguage(defaultPreset.voiceLanguage);
      return;
    }

    setSelectedLangName(name);
    const preset = SUPPORTED_LANGUAGES.find((l) => l.name === name);
    if (preset) {
      setCustomName(preset.name);
      setCountryCode(preset.countryCode);
      setVoiceLanguage(preset.voiceLanguage);
    }
  };

  // TanStack Query Save Mutation (Handles Create & Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: { name: string; countryCode: string; voiceLanguage: string; id?: string }) => {
      const url = "/api/admin/foundation/languages";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isEditing ? "Failed to update language" : "Failed to create language");
      }

      return res.json();
    },
    onSuccess: () => {
      // Automatically refetch any query using the ["languages"] key
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || saveMutation.isPending) return;

    saveMutation.mutate({
      ...(isEditing && languageToEdit ? { id: languageToEdit.id } : {}),
      name: customName.trim(),
      countryCode: countryCode.toLowerCase().trim(),
      voiceLanguage: voiceLanguage.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800">
            {isEditing ? "Update Language" : "Add New Language"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Preset Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Select Language Preset
            </label>
            <Select value={selectedLangName} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full h-11 border-2 border-slate-200 rounded-xl bg-white font-bold text-slate-700">
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-slate-200 shadow-lg">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.name} value={lang.name} className="cursor-pointer font-semibold py-2.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={lang.flagUrl}
                        alt={lang.name}
                        className="w-5 h-3.5 object-cover rounded-xs border border-slate-200"
                      />
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Name (Editable) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">
              Display Name
            </label>
            <Input
              placeholder="Language Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="h-10 font-bold border-slate-200"
              required
            />
          </div>

          {/* Configuration Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Flag Code (ISO 2)
              </label>
              <div className="relative flex items-center">
                <Input
                  disabled
                  value={countryCode}
                  className="pr-8 uppercase font-bold bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                />
                {countryCode && (
                  <img
                    src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                    alt="Preview"
                    className="absolute right-2.5 w-5 h-3.5 object-cover rounded-xs border border-slate-200 opacity-70"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Voice BCP-47 Tag
              </label>
              <Input
                disabled
                value={voiceLanguage}
                className="font-bold bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-xl shadow-md disabled:opacity-50"
          >
            {saveMutation.isPending
              ? "Saving..."
              : isEditing
              ? "Update Language"
              : "Save Language"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}