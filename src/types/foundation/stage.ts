import { ActivityPayload, ActivityType } from "./materials";

export interface Stage {
  id: string;
  roadmapId: string;
  type: ActivityType;
  title?: string;
  question?: string;
  order?: number;
  payload: ActivityPayload;
  createdAt?: string;
  updatedAt?: string;
}