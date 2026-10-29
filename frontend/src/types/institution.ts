export interface Institution {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  verified: boolean;
  createdAt: string;
}

export interface InstitutionDetail extends Institution {
  stats: {
    memberCount: number;
    livePollCount: number;
    completedPollCount: number;
    totalPoints: number;
  };
  topContributors: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    points: number;
  }[];
}

export interface InstitutionMember {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  points: number;
  reputation: number;
  createdAt: string;
}
