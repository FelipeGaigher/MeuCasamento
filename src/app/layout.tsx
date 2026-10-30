import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fontes locais (src/app/fonts): o build nao depende do Google Fonts.
// Poppins e a fonte do sistema (LP, cadastro e painel). As demais vestem o convite e o site do casal.
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});
const inter = localFont({ src: "./fonts/inter-latin-wght-normal.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-wght-normal.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-wght-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});
const playfair = localFont({ src: "./fonts/playfair-display-latin-wght-normal.woff2", weight: "400 900", variable: "--font-playfair", display: "swap" });
const pinyon = localFont({ src: "./fonts/pinyon-script-latin-400-normal.woff2", weight: "400", variable: "--font-pinyon", display: "swap" });
const greatVibes = localFont({ src: "./fonts/great-vibes-latin-400-normal.woff2", weight: "400", variable: "--font-greatvibes", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meu Casamento", template: "%s · Meu Casamento" },
  description: "Convite, site, confirmação de presença e lista de presentes do seu casamento, num lugar só.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable} ${cormorant.variable} ${playfair.variable} ${pinyon.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}
