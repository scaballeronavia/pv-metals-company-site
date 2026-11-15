// Contacto confirmado en DOC/PVMETALSCOMPANY_Levantamiento_Landing_Page_ACTUALIZADO.md.
const companyWhatsApp = "59176486230";
const authorWhatsApp = "59179391508";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scaballeronavia.github.io/pv-metals-company-site/";

function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const siteContact = {
  quote: whatsappLink(companyWhatsApp, "Hola, quisiera solicitar una cotización a PV Metals Company"),
  toll: whatsappLink(companyWhatsApp, "Hola, quisiera consultar sobre el servicio Toll"),
  email: "mailto:pvmetalscompany@gmail.com?subject=Consulta%20PV%20Metals%20Company",
  address: "Av. Gualberto Villarroel s/n, esquina Pasaje sin nombre, Zona El Abra, Cochabamba, Bolivia.",
  author: `https://wa.me/${authorWhatsApp}`,
  commercialWhatsapp: `https://wa.me/${companyWhatsApp}`,
} as const;

export const socialLinks = {
  facebookProfile: "https://www.facebook.com/profile.php?id=100094143918685",
  instagramProfile: "https://www.instagram.com/pv_metals_company?mdxt=MWQ0azRvNGkyMGxqbQ==",
  tiktokProfile: "https://www.tiktok.com/@pvmetalscompany?_r=1&_t=ZS-9BQhTfuuWsW",
  facebookShare: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`,
} as const;
