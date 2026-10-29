"use client";

import { LegalPage } from "@/components/legal/legal-page";
import { termsContent } from "@/lib/legal/content";

export default function TermsPage() {
  return <LegalPage content={termsContent} />;
}
