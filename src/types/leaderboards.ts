export type Language = {
  id: string;
  name: string;
  countryCode: string;
  order: number;
};

export type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  languageId: string;
};

export type Session = {
  id: string;
  title: string | null;
  languageId: string;
};

export type PublicUser = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  xp: number
};

export type FoundationScore = {
  id: string;
  userId: string;
  languageId: string;
  roadmapId: string;
  stageId: string;
  durationMs: number;
  wrongAttempts: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  user: PublicUser;
  stage: {
    id: string;
    order: number;
    roadmapId: string;
    roadmap: {
      id: string;
      title: string;
      order: number;
      languageId: string;
    };
  };
};

export type StoryProgress = {
  id: string;
  userId: string;
  sessionId: string;
  currentNodeId: string | null;
  winCount: number;
  lossCount: number;
  updatedAt: string;
  user: PublicUser;
  session: Session;
};

export type ApiResponse = {
  languages: Language[];
  roadmaps: Roadmap[];
  sessions: Session[];
  scores: FoundationScore[];
  progress: StoryProgress[];
  error?: string;
};

export type FoundationEntry = {
  userId: string;
  name: string;
  imageUrl: string | null;
  roadmapId: string;
  roadmapTitle: string;
  roadmapOrder: number;
  stageOrder: number;
  durationMs: number;
  wrongAttempts: number;
  playCount: number;
  points: number;
  recordedStages: number;
  totalDurationMs: number;
  totalWrongAttempts: number;
};

export type StoryEntry = {
  userId: string;
  name: string;
  imageUrl: string | null;
  wins: number;
  losses: number;
  winRate: number;
  sessionsPlayed: number;
};