"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/categories/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
