import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRoot from "./ClientRoot";

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
      <body className={`${inter.className} bg-gray-50`}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
