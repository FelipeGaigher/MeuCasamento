import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Inter, Pinyon_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon", display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meu Casamento", template: "%s · Meu Casamento" },
  description: "Convite, site, confirmacao de presenca e lista de presentes do seu casamento, num lugar so.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cormorant.variable} ${playfair.variable} ${pinyon.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}
