export type UserRole =
  | "STUDENT"
  | "RESEARCHER"
  | "PROFESSOR"
  | "INSTITUTION_ADMIN"
  | "MODERATOR"
  | "FRAUD_INVESTIGATOR"
  | "SUPER_ADMIN";

export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";

export type AcademicLevel =
  | "UNDERGRADUATE"
  | "GRADUATE"
  | "MASTERS"
  | "PHD"
  | "POSTDOC"
  | "FACULTY"
  | "OTHER";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  points: number;
  reputation: number;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  language: "EN" | "AR";
  institutionId: string | null;
  createdAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  academicRole?: AcademicLevel;
  institutionName?: string;
  country?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}
