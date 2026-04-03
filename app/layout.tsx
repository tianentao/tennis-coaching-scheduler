import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export const metadata: Metadata = {
  title: "Tennis Coaching Scheduler",
  description: "Plan coaching sessions and manage bookings."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
          <Sidebar />
          <main className="flex-1 space-y-6">
            <TopBar />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
