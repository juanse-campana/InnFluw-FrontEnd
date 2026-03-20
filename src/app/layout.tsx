import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider, AuthProvider } from "@/components/providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InnFluw - Instant Drop SaaS",
  description: "Create and manage product drops with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
