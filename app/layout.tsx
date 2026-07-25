import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireLens | AI-powered recruiting intelligence",
  description:
    "HireLens helps recruiting teams screen faster and make better hiring decisions with AI-powered insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
