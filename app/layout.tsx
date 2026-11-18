import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tennis Coaching Scheduler",
  description: "Book and manage tennis coaching sessions with Supabase and Next.js."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="court-shell antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
