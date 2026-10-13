import { siteContact } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>PV METALS COMPANY</span>
      <span>COCHABAMBA · BOLIVIA</span>
      <span className="footer-credit">
        Hecho por <a href={siteContact.author} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Ing. Santiago Caballero">Ing. Santiago Caballero</a>
      </span>
      <a href="#inicio">Volver arriba ↑</a>
    </footer>
  );
}
