-- Non-destructive rename: Poll -> Survey (reverses the earlier Survey -> Poll rename).
-- Uses RENAME statements throughout so existing rows and relationships are preserved.

-- RenameEnum
ALTER TYPE "PollStatus" RENAME TO "SurveyStatus";
ALTER TYPE "PollReportReason" RENAME TO "SurveyReportReason";

-- RenameEnumValue (NotificationType)
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_APPROVED' TO 'SURVEY_APPROVED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_REJECTED' TO 'SURVEY_REJECTED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_PAUSED' TO 'SURVEY_PAUSED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_CLOSED' TO 'SURVEY_CLOSED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_COMPLETED' TO 'SURVEY_COMPLETED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_EXPIRED' TO 'SURVEY_EXPIRED';
ALTER TYPE "NotificationType" RENAME VALUE 'POLL_DEADLINE_REMINDER' TO 'SURVEY_DEADLINE_REMINDER';
ALTER TYPE "NotificationType" RENAME VALUE 'NEW_RECOMMENDED_POLL' TO 'NEW_RECOMMENDED_SURVEY';

-- RenameTable
ALTER TABLE "polls" RENAME TO "surveys";
ALTER TABLE "poll_tags" RENAME TO "survey_tags";
ALTER TABLE "poll_responses" RENAME TO "survey_responses";
ALTER TABLE "poll_bookmarks" RENAME TO "survey_bookmarks";
ALTER TABLE "poll_reports" RENAME TO "survey_reports";

-- RenameColumn
ALTER TABLE "surveys" RENAME COLUMN "pollUrl" TO "surveyUrl";
ALTER TABLE "survey_tags" RENAME COLUMN "pollId" TO "surveyId";
ALTER TABLE "survey_responses" RENAME COLUMN "pollId" TO "surveyId";
ALTER TABLE "survey_bookmarks" RENAME COLUMN "pollId" TO "surveyId";
ALTER TABLE "survey_reports" RENAME COLUMN "pollId" TO "surveyId";

-- RenameConstraint (primary keys)
ALTER TABLE "surveys" RENAME CONSTRAINT "polls_pkey" TO "surveys_pkey";
ALTER TABLE "survey_tags" RENAME CONSTRAINT "poll_tags_pkey" TO "survey_tags_pkey";
ALTER TABLE "survey_responses" RENAME CONSTRAINT "poll_responses_pkey" TO "survey_responses_pkey";
ALTER TABLE "survey_bookmarks" RENAME CONSTRAINT "poll_bookmarks_pkey" TO "survey_bookmarks_pkey";
ALTER TABLE "survey_reports" RENAME CONSTRAINT "poll_reports_pkey" TO "survey_reports_pkey";

-- RenameConstraint (foreign keys)
ALTER TABLE "surveys" RENAME CONSTRAINT "polls_creatorId_fkey" TO "surveys_creatorId_fkey";
ALTER TABLE "surveys" RENAME CONSTRAINT "polls_institutionId_fkey" TO "surveys_institutionId_fkey";
ALTER TABLE "surveys" RENAME CONSTRAINT "polls_categoryId_fkey" TO "surveys_categoryId_fkey";
ALTER TABLE "survey_tags" RENAME CONSTRAINT "poll_tags_pollId_fkey" TO "survey_tags_surveyId_fkey";
ALTER TABLE "survey_tags" RENAME CONSTRAINT "poll_tags_tagId_fkey" TO "survey_tags_tagId_fkey";
ALTER TABLE "survey_responses" RENAME CONSTRAINT "poll_responses_pollId_fkey" TO "survey_responses_surveyId_fkey";
ALTER TABLE "survey_responses" RENAME CONSTRAINT "poll_responses_userId_fkey" TO "survey_responses_userId_fkey";
ALTER TABLE "survey_bookmarks" RENAME CONSTRAINT "poll_bookmarks_pollId_fkey" TO "survey_bookmarks_surveyId_fkey";
ALTER TABLE "survey_bookmarks" RENAME CONSTRAINT "poll_bookmarks_userId_fkey" TO "survey_bookmarks_userId_fkey";
ALTER TABLE "survey_reports" RENAME CONSTRAINT "poll_reports_pollId_fkey" TO "survey_reports_surveyId_fkey";
ALTER TABLE "survey_reports" RENAME CONSTRAINT "poll_reports_reporterId_fkey" TO "survey_reports_reporterId_fkey";

-- RenameIndex
ALTER INDEX "polls_status_idx" RENAME TO "surveys_status_idx";
ALTER INDEX "polls_creatorId_idx" RENAME TO "surveys_creatorId_idx";
ALTER INDEX "polls_categoryId_idx" RENAME TO "surveys_categoryId_idx";
ALTER INDEX "poll_responses_pollId_userId_key" RENAME TO "survey_responses_surveyId_userId_key";
ALTER INDEX "poll_bookmarks_pollId_userId_key" RENAME TO "survey_bookmarks_surveyId_userId_key";
