import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeToggle } from "../components/ThemeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Traffic LOS Analysis System",
  description: "Traffic Level of Service analysis with PCU, density, and flow calculations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 via-transparent to-transparent"></div>
          </div>
          <ThemeToggle />
          <main className="relative z-10 w-full min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
