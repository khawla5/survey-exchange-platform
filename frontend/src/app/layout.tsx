import type { Metadata } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SurveyXchange",
  description:
    "Exchange survey responses with students, researchers, professors and universities through a point-based ecosystem.",
};

const themeInitScript = `
(function () {
  try {
    var storedTheme = localStorage.getItem('sep-theme');
    var theme = storedTheme || 'system';
    var isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);

    var storedLang = localStorage.getItem('sep-language') || 'en';
    document.documentElement.lang = storedLang;
    document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-lang-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
