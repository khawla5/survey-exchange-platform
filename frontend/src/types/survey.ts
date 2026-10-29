export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
}

export type SurveyStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "LIVE"
  | "PAUSED"
  | "COMPLETED"
  | "EXPIRED"
  | "ARCHIVED"
  | "DELETED";

export interface SurveyCreator {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface SurveyInstitution {
  id: string;
  name: string;
  verified: boolean;
  logo: string | null;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  thumbnail: string | null;
  surveyUrl: string;
  completionCode: string | null;
  estimatedTimeMinutes: number;
  targetResponses: number;
  currentResponses: number;
  reward: number;
  publishingCost: number;
  deadline: string;
  status: SurveyStatus;
  views: number;
  creatorId: string;
  creator: SurveyCreator;
  institution: SurveyInstitution | null;
  tags: { tag: { id: string; name: string } }[];
  createdAt: string;
  publishedAt: string | null;
  viewerState?: { bookmarked: boolean; completed: boolean };
}

export interface CreateSurveyPayload {
  title: string;
  description: string;
  categoryId: string;
  surveyUrl: string;
  completionCode?: string;
  estimatedTimeMinutes: number;
  targetResponses: number;
  reward: number;
  deadline: string;
  tags?: string[];
  targetCountry?: string;
  publish: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
