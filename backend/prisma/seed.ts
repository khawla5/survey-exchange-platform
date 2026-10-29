import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Computer Science", nameAr: "علوم الحاسب", slug: "computer-science", icon: "cpu", color: "#3B82F6" },
  { name: "Engineering", nameAr: "الهندسة", slug: "engineering", icon: "wrench", color: "#F59E0B" },
  { name: "Business", nameAr: "إدارة الأعمال", slug: "business", icon: "briefcase", color: "#22C55E" },
  { name: "Medicine", nameAr: "الطب", slug: "medicine", icon: "stethoscope", color: "#EF4444" },
  { name: "Education", nameAr: "التربية والتعليم", slug: "education", icon: "graduation-cap", color: "#F08080" },
  { name: "Law", nameAr: "القانون", slug: "law", icon: "scale", color: "#6B7280" },
  { name: "Arts", nameAr: "الفنون", slug: "arts", icon: "palette", color: "#F4978E" },
  { name: "Psychology", nameAr: "علم النفس", slug: "psychology", icon: "brain", color: "#F8AD9D" },
  { name: "Marketing", nameAr: "التسويق", slug: "marketing", icon: "megaphone", color: "#3B82F6" },
  { name: "Finance", nameAr: "المالية", slug: "finance", icon: "landmark", color: "#22C55E" },
  { name: "Science", nameAr: "العلوم", slug: "science", icon: "flask-conical", color: "#F59E0B" },
  { name: "Health", nameAr: "الصحة", slug: "health", icon: "heart-pulse", color: "#EF4444" },
  { name: "Social Science", nameAr: "العلوم الاجتماعية", slug: "social-science", icon: "users", color: "#F08080" },
  { name: "Architecture", nameAr: "العمارة", slug: "architecture", icon: "building-2", color: "#6B7280" },
  { name: "Other", nameAr: "أخرى", slug: "other", icon: "shapes", color: "#9CA3AF" },
];

const achievements = [
  {
    key: "first_survey_published",
    name: "First Survey",
    description: "Published your first survey",
    category: "PUBLISHING",
    icon: "rocket",
    color: "#F08080",
    pointsReward: 20,
    criteria: { type: "surveys_published", threshold: 1 },
  },
  {
    key: "first_completion",
    name: "First Completion",
    description: "Completed your first survey",
    category: "CONTRIBUTION",
    icon: "check-circle",
    color: "#22C55E",
    pointsReward: 10,
    criteria: { type: "surveys_completed", threshold: 1 },
  },
  {
    key: "ten_completions",
    name: "10 Surveys",
    description: "Completed 10 surveys",
    category: "CONTRIBUTION",
    icon: "award",
    color: "#22C55E",
    pointsReward: 30,
    criteria: { type: "surveys_completed", threshold: 10 },
  },
  {
    key: "fifty_completions",
    name: "50 Surveys",
    description: "Completed 50 surveys",
    category: "CONTRIBUTION",
    icon: "medal",
    color: "#F59E0B",
    pointsReward: 100,
    criteria: { type: "surveys_completed", threshold: 50 },
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Rename cleanup: "first_poll_published" became "first_survey_published".
  const staleKey = await prisma.achievement.findUnique({
    where: { key: "first_poll_published" },
  });
  if (staleKey) {
    await prisma.userAchievement.deleteMany({ where: { achievementId: staleKey.id } });
    await prisma.achievement.delete({ where: { id: staleKey.id } });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Seeded ${categories.length} categories and ${achievements.length} achievements.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
