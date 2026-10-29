import { Category } from "@/types/poll";

export function localizedCategoryName(category: Pick<Category, "name" | "nameAr">, language: string): string {
  return language === "ar" && category.nameAr ? category.nameAr : category.name;
}
