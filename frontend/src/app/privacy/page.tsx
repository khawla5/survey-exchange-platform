"use client";

import { LegalPage } from "@/components/legal/legal-page";
import { privacyContent } from "@/lib/legal/content";

export default function PrivacyPage() {
  return <LegalPage content={privacyContent} />;
}
