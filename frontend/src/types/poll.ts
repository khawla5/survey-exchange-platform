export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
}

export type PollStatus =
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

export interface PollCreator {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface PollInstitution {
  id: string;
  name: string;
  verified: boolean;
  logo: string | null;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  thumbnail: string | null;
  pollUrl: string;
  completionCode: string | null;
  estimatedTimeMinutes: number;
  targetResponses: number;
  currentResponses: number;
  reward: number;
  publishingCost: number;
  deadline: string;
  status: PollStatus;
  views: number;
  creatorId: string;
  creator: PollCreator;
  institution: PollInstitution | null;
  tags: { tag: { id: string; name: string } }[];
  createdAt: string;
  publishedAt: string | null;
  viewerState?: { bookmarked: boolean; completed: boolean };
}

export interface CreatePollPayload {
  title: string;
  description: string;
  categoryId: string;
  pollUrl: string;
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
