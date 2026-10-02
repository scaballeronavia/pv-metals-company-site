import type { Metadata } from "next";
import { siteAsset } from "@/lib/site-asset";
import "./globals.css";

export const metadata: Metadata = {
  title: "PV Metals Company | Refinación de plata",
  description:
    "PV Metals Company: refinación especializada de plata, lingotes, granalla y servicio toll en Cochabamba, Bolivia.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head><link rel="preload" as="image" href={siteAsset("/images/pv-ingot-concept.jpg")} /></head>
      <body>{children}</body>
    </html>
  );
}
