"use client";

import React from "react";
import { SentenceBuilder } from "./LearningMaterials/SentenceBuilder";
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
import { LetterTracing } from "./LearningMaterials/LetterTracing";
import { FillInTheBlank } from "./LearningMaterials/FillInTheBlank";
import { TapWhatYouHear } from "./LearningMaterials/TapWhatYouHear";
import { MultipleChoice } from "./LearningMaterials/MultipleChoice";
import { MatchingPairs } from "./LearningMaterials/MatchingPairs";

export interface RoadmapLanguage {
  id?: string;
  name?: string;
  countryCode?: string;
  voiceLanguage?: string;
}

export interface StageRoadmap {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  languageId?: string;
  language?: RoadmapLanguage;
}

export interface StageData {
  id: string;
  type: ActivityType;
  order: number;
  payload: ActivityPayload;
  roadmapId?: string;
  roadmap?: StageRoadmap;
  createdAt?: string;
  updatedAt?: string;
}

interface StageMaterialRendererProps {
  stage: StageData;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function StageMaterialRenderer({
  stage,
  onAnswerChange,
}: StageMaterialRendererProps) {
  const voiceLanguage = stage.roadmap?.language?.voiceLanguage || "en-US";

  switch (stage.type) {
    case "sentenceBuilder":
      return (
        <SentenceBuilder
          payload={stage.payload as SentenceBuilderPayload}
          voiceLanguage={voiceLanguage}
          onAnswerChange={onAnswerChange}
        />
      );

    case "tracing":
      return (
        <LetterTracing
          payload={stage.payload as LetterTracingPayload}
          onAnswerChange={onAnswerChange}
        />
      );

    case "fillInTheBlank":
      return (
        <FillInTheBlank
          payload={stage.payload as FillInTheBlankPayload}
          voiceLanguage={voiceLanguage}
          onAnswerChange={onAnswerChange}
        />
      );

    case "tapWhatYouHear":
      return (
        <TapWhatYouHear
          payload={stage.payload as TapWhatYouHearPayload}
          voiceLanguage={voiceLanguage}
          onAnswerChange={onAnswerChange}
        />
      );

    case "multipleChoice":
      return (
        <MultipleChoice
          payload={stage.payload as MultipleChoicePayload}
          onAnswerChange={onAnswerChange}
        />
      );

    case "matching":
      return (
        <MatchingPairs
          payload={stage.payload as MatchingPairsPayload}
          onAnswerChange={onAnswerChange}
        />
      );

    default:
      console.warn(`Unsupported activity type: ${stage.type}`);
      return null;
  }
}