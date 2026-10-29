-- Clean up legacy notification rows using the old SURVEY_* enum values before the enum swap below.
DELETE FROM "notifications" WHERE "type"::text LIKE 'SURVEY_%' OR "type"::text = 'NEW_RECOMMENDED_SURVEY';

-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'LIVE', 'PAUSED', 'COMPLETED', 'EXPIRED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "PollReportReason" AS ENUM ('SPAM', 'BROKEN_LINK', 'FRAUD', 'OFFENSIVE', 'DUPLICATE', 'HARASSMENT', 'FAKE_RESPONSES', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('POLL_APPROVED', 'POLL_REJECTED', 'POLL_PAUSED', 'POLL_CLOSED', 'POLL_COMPLETED', 'POLL_EXPIRED', 'POLL_DEADLINE_REMINDER', 'NEW_RECOMMENDED_POLL', 'POINTS_EARNED', 'POINTS_SPENT', 'POINTS_REFUNDED', 'ACHIEVEMENT_UNLOCKED', 'LEADERBOARD_RANK_CHANGED', 'INSTITUTION_INVITATION', 'INSTITUTION_ACCEPTED', 'INSTITUTION_REMOVED', 'ADMIN_ANNOUNCEMENT', 'SECURITY_ALERT', 'LOGIN_NEW_DEVICE', 'PASSWORD_CHANGED', 'ACCOUNT_VERIFIED', 'SYSTEM_MAINTENANCE');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "survey_bookmarks" DROP CONSTRAINT "survey_bookmarks_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "survey_bookmarks" DROP CONSTRAINT "survey_bookmarks_userId_fkey";

-- DropForeignKey
ALTER TABLE "survey_reports" DROP CONSTRAINT "survey_reports_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "survey_reports" DROP CONSTRAINT "survey_reports_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_userId_fkey";

-- DropForeignKey
ALTER TABLE "survey_tags" DROP CONSTRAINT "survey_tags_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "survey_tags" DROP CONSTRAINT "survey_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_institutionId_fkey";

-- DropTable
DROP TABLE "survey_bookmarks";

-- DropTable
DROP TABLE "survey_reports";

-- DropTable
DROP TABLE "survey_responses";

-- DropTable
DROP TABLE "survey_tags";

-- DropTable
DROP TABLE "surveys";

-- DropEnum
DROP TYPE "SurveyReportReason";

-- DropEnum
DROP TYPE "SurveyStatus";

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "thumbnail" TEXT,
    "pollUrl" TEXT NOT NULL,
    "completionCode" TEXT,
    "estimatedTimeMinutes" INTEGER NOT NULL,
    "targetResponses" INTEGER NOT NULL,
    "currentResponses" INTEGER NOT NULL DEFAULT 0,
    "reward" INTEGER NOT NULL,
    "publishingCost" INTEGER NOT NULL,
    "boostCost" INTEGER,
    "priorityLevel" INTEGER NOT NULL DEFAULT 0,
    "boostExpiresAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "PollStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAcademicLevel" "AcademicLevel",
    "targetCountry" TEXT,
    "targetLanguage" "Language",
    "targetGender" "Gender",
    "targetAgeMin" INTEGER,
    "targetAgeMax" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "creatorId" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_tags" (
    "pollId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "poll_tags_pkey" PRIMARY KEY ("pollId","tagId")
);

-- CreateTable
CREATE TABLE "poll_responses" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "completionCode" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_bookmarks" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_reports" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "PollReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "poll_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "polls_status_idx" ON "polls"("status");

-- CreateIndex
CREATE INDEX "polls_creatorId_idx" ON "polls"("creatorId");

-- CreateIndex
CREATE INDEX "polls_categoryId_idx" ON "polls"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_responses_pollId_userId_key" ON "poll_responses"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_bookmarks_pollId_userId_key" ON "poll_bookmarks"("pollId", "userId");

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_tags" ADD CONSTRAINT "poll_tags_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_tags" ADD CONSTRAINT "poll_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_responses" ADD CONSTRAINT "poll_responses_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_responses" ADD CONSTRAINT "poll_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_bookmarks" ADD CONSTRAINT "poll_bookmarks_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_bookmarks" ADD CONSTRAINT "poll_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_reports" ADD CONSTRAINT "poll_reports_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_reports" ADD CONSTRAINT "poll_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

