import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialPlanner",
  description: "Social media planning application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
