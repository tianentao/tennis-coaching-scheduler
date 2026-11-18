import type { Metadata } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/demo-banner";
import { SiteHeader } from "@/components/site-header";

const description =
  "A full-stack tennis coaching scheduler: weekly calendar, race-safe booking, and coach tools. Built with Next.js, Supabase, and PostgreSQL Row Level Security.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tennis-coaching-scheduler.vercel.app"),
  title: "Tennis Coaching Scheduler · Live Demo",
  description,
  openGraph: {
    title: "Tennis Coaching Scheduler · Live Demo",
    description,
    url: "/",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="court-shell antialiased">
        <DemoBanner />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
