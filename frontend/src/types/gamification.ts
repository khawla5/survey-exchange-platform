export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  pointsReward: number;
  visible: boolean;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  points: number;
  reputation: number;
  country: string | null;
  institution: { name: string; verified: boolean } | null;
  periodPoints: number;
}
