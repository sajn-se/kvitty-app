import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const baseUrl = "https://www.kvitty.se";
const imageUrl = `${baseUrl}/assets/SCR-20260105-mywx.png`;

export const metadata: Metadata = {
  title: "Kvitty - Bokföring för småföretag",
  description: "Enkel bokföring för små team. Hantera kvitton, fakturor, löner och banktransaktioner på ett smidigt sätt. Gratis.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Kvitty - Bokföring för småföretag",
    description: "Enkel bokföring för små team. Hantera kvitton, fakturor, löner och banktransaktioner på ett smidigt sätt. Gratis.",
    url: baseUrl,
    siteName: "Kvitty",
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Kvitty Dashboard",
        type: "image/png",
      },
    ],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kvitty - Bokföring för småföretag",
    description: "Enkel bokföring för små team. Hantera kvitton, fakturor, löner och banktransaktioner på ett smidigt sätt. Gratis.",
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={inter.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
