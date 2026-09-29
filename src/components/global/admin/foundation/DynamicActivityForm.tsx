"use client";

import React from "react";
import { SentenceBuilderForm } from "./LearningMaterials/SentenceBuilderForm";
import { LetterTracingForm } from "./LearningMaterials/LetterTracingForm";
import { MultipleChoiceForm } from "./LearningMaterials/MultipleChoiceForm";
import { TapWhatYouHearForm } from "./LearningMaterials/TapWhatYouHearForm";
import { FillInTheBlankForm } from "./LearningMaterials/FillInTheBlankForm";
import { MatchingPairsForm } from "./LearningMaterials/MatchingPairsForm";
import {
  ActivityPayload,
  ActivityType,
  FillInTheBlankPayload,
  LetterTracingPayload,
  MatchingPairsPayload,
  MultipleChoicePayload,
  SentenceBuilderPayload,
  TapWhatYouHearPayload,
} from "@/types/foundation/materials";

interface DynamicActivityFormProps {
  type: ActivityType | string;
  /** Optional unique identifier for the current stage/activity item to guarantee a clean reset when switching items */
  activityId?: string | number;
  initialData?: Partial<ActivityPayload> | null;
  onSubmit: (payload: ActivityPayload) => void;
}

export function DynamicActivityForm({
  type,
  activityId,
  initialData,
  onSubmit,
}: DynamicActivityFormProps) {
  // Safe cast for onChange handler across distinct activity payload shapes
  // const handleFormChange = onChange as (payload: any) => void;

  // Composite key ensures component state resets ONLY when switching type or item ID
  const formKey = activityId ? `${type}-${activityId}` : type;

  switch (type) {
    case "sentenceBuilder": {
      return (
        <SentenceBuilderForm
          initialData={initialData as any}
          onSubmit={onSubmit}
        />
      );
    }

    case "matching": {
      return (
        <MatchingPairsForm
          key={formKey}
          initialData={initialData as Partial<MatchingPairsPayload>}
          onSubmit={onSubmit}
        />
      );
    }

    case "multipleChoice": {
      return (
        <MultipleChoiceForm
          key={formKey}
          initialData={initialData as Partial<MultipleChoicePayload>}
          onSubmit={onSubmit}
        />
      );
    }

    case "tapWhatYouHear": {
      return (
        <TapWhatYouHearForm
          key={formKey}
          initialData={initialData as Partial<TapWhatYouHearPayload>}
          onSubmit={onSubmit}
        />
      );
    }

    case "fillInTheBlank": {
      return (
        <FillInTheBlankForm
          key={formKey}
          initialData={initialData as Partial<FillInTheBlankPayload>}
          onSubmit={onSubmit}
        />
      );
    }

    case "tracing": {
      return (
        <LetterTracingForm
          key={formKey}
          initialData={initialData as Partial<LetterTracingPayload>}
          onSubmit={onSubmit}
        />
      );
    }

    default:
      return null;
  }
}