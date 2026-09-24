import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
