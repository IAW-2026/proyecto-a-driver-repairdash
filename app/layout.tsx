import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; 
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Diferentes grosores para títulos y cuerpo
});

export const metadata: Metadata = {
  title: "RepairDash | Dashboard",
  description: "Sistema de gestión con Next.js y Tailwind v4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-primary text-highlight font-sans">
        {children}
      </body>
    </html>
  );
}