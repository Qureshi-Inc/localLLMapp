import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const ClientNavbar = dynamic(() => import("@/components/NavbarClient"), {
  ssr: false,
  loading: () => null,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskPulse",
  description: "Modern task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientNavbar />
        {children}
      </body>
    </html>
  );
}
