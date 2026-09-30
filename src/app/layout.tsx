import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

// The logo wordmark only.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

// Everything else: 400 body, 600 titles and emphasis, 700 page titles.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Each page renders its own <title> (see PageTitle), so none is set here.
export const metadata: Metadata = {
  description:
    "Book vetted carers for walks, sitting, boarding, grooming and vet visits, and follow every visit live.",
  applicationName: "PetBuddy",
};

export const viewport: Viewport = {
  themeColor: "#5170FF",
};

// The shell has no data of its own; every page and widget that fetches is a
// client component under <Providers>.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          {/* A column that fills the screen under the header, so a page's empty state can centre in it. */}
          <main id="main" className="flex min-h-page flex-1 flex-col pb-16 sm:pb-24">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
