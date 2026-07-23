import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controlling produkcji — wtryskownia",
  description: "Demo systemu controllingu produkcyjnego dla wtryskowni tworzyw sztucznych",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
