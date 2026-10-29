import { Category } from "@/types/survey";

export function localizedCategoryName(category: Pick<Category, "name" | "nameAr">, language: string): string {
  return language === "ar" && category.nameAr ? category.nameAr : category.name;
}
