// Contacto confirmado en DOC/PVMETALSCOMPANY_Levantamiento_Landing_Page_ACTUALIZADO.md.
const companyWhatsApp = "59176486230";
const authorWhatsApp = "59179391508";

function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const siteContact = {
  quote: whatsappLink(companyWhatsApp, "Hola, quisiera solicitar una cotización a PV Metals Company"),
  toll: whatsappLink(companyWhatsApp, "Hola, quisiera consultar sobre el servicio Toll"),
  email: "mailto:pvmetalscompany@gmail.com?subject=Consulta%20PV%20Metals%20Company",
  address: "Av. Gualberto Villarroel s/n, esquina Pasaje sin nombre, Zona El Abra, Cochabamba, Bolivia.",
  author: whatsappLink(authorWhatsApp, "Hola, Ing. Santiago, vi el sitio de PV Metals Company"),
} as const;
