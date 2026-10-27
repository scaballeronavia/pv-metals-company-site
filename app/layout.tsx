import type { Metadata } from "next";
import { siteAsset } from "@/lib/site-asset";
import { siteUrl } from "@/lib/site-config";
import "./tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PV Metals Company | Refinación especializada de plata",
    template: "%s | PV Metals Company",
  },
  description:
    "Refinación especializada de plata en Cochabamba, Bolivia. Conoce nuestros lingotes, granalla de plata y servicio de refinación Toll.",
  applicationName: "PV Metals Company",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: siteUrl,
    siteName: "PV Metals Company",
    title: "PV Metals Company | Refinación especializada de plata",
    description:
      "Refinación especializada de plata en Cochabamba, Bolivia. Lingotes, granalla de plata y servicio de refinación Toll.",
    images: [
      {
        // metadataBase agrega el nombre del repositorio durante la exportación de Pages.
        url: "/images/pv-metals-open-graph.jpg",
        width: 1200,
        height: 630,
        alt: "Lingote de plata con la marca PV Metals Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PV Metals Company | Refinación especializada de plata",
    description:
      "Refinación especializada de plata en Cochabamba, Bolivia. Lingotes, granalla de plata y servicio de refinación Toll.",
    images: ["/images/pv-metals-open-graph.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: siteAsset("/images/pv-isotype-color-dark.svg") },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PV Metals Company",
  url: siteUrl,
  logo: new URL(siteAsset("/images/pv-isotype-color-dark.svg"), siteUrl).toString(),
  description:
    "Refinación especializada de plata en Cochabamba, Bolivia.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Gualberto Villarroel s/n, esquina Pasaje sin nombre, Zona El Abra",
    addressLocality: "Cochabamba",
    addressCountry: "BO",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head><link rel="preload" as="image" href={siteAsset("/images/pv-ingot-silver-brand.webp")} /></head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
