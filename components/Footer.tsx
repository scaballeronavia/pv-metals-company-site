import { siteContact, socialLinks } from "@/lib/site-config";
import VisitorCounter from "@/components/VisitorCounter";

export default function Footer() {
  return (
    <>
      <a className="facebook-share-float" href={socialLinks.facebookShare} target="_blank" rel="noopener noreferrer" aria-label="Compartir PV Metals Company en Facebook" title="Compartir en Facebook">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.2H10V21h3.4Z" fill="currentColor" /></svg>
      </a>
      <footer className="site-footer">
        <span>PV METALS COMPANY</span>
        <span>COCHABAMBA · BOLIVIA</span>
        <span className="footer-credit">
          Hecho por <a href={siteContact.author} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Ing. Santiago Caballero">Ing. Santiago Caballero</a>
        </span>
        <VisitorCounter />
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </>
  );
}
