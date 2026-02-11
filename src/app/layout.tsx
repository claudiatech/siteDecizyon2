import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Decizyon | Eficiência que flui",
    template: "%s | Decizyon"
  },
  description:
    "Decizyon — Eficiência que flui. Plataforma para criar, automatizar e auditar processos internos com aprovações multinível e governança completa.",
  metadataBase: new URL("https://decizyon.local"),
  openGraph: {
    title: "Decizyon | Eficiência que flui",
    description:
      "Crie, automatize e audite processos internos com governança e rastreabilidade.",
    images: [
      {
        url: "/og-decizyon.svg",
        width: 1200,
        height: 630,
        alt: "Decizyon — Eficiência que flui"
      }
    ],
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
