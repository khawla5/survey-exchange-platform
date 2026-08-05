import { z } from "zod";
import { AcademicLevel, Gender, Language, ProfileVisibility } from "@prisma/client";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  department: z.string().trim().max(150).optional(),
  discipline: z.string().trim().max(150).optional(),
  country: z.string().trim().max(100).optional(),
  timezone: z.string().trim().max(100).optional(),
  language: z.nativeEnum(Language).optional(),
  academicLevel: z.nativeEnum(AcademicLevel).optional(),
  gender: z.nativeEnum(Gender).optional(),
  profileVisibility: z.nativeEnum(ProfileVisibility).optional(),
  hideLeaderboard: z.boolean().optional(),
  hideStatistics: z.boolean().optional(),
  hideActivity: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
