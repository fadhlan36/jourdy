import type { Metadata } from "next"; // Tambahkan import ini
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Jourdy",
    template: "%s | Jourdy",
  },
  description: "Digital Journal with AI Mood Analysis",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* Kita langsung tempel font-nya ke className body */}
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
