import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import RedirectHandler from "@/components/auth/redirect-handler";
import Shell from "@/components/common/shell";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sayari",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.className} antialiased h-full`}>
        <AuthProvider>
          <RedirectHandler />
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
