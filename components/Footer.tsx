import Image from "next/image";
import { siteAsset } from "@/lib/site-asset";
import { siteContact, socialLinks } from "@/lib/site-config";
import VisitorCounter from "@/components/VisitorCounter";

const footerNavigation = [
  { label: "Recorrido", href: "#materia" },
  { label: "Servicio Toll", href: "#toll" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Productos", href: "#productos" },
  { label: "Comunidad", href: "#responsabilidad" },
  { label: "Contacto", href: "#contacto" },
] as const;

export default function Footer() {
  return (
    <>
      <a className="facebook-share-float" href={socialLinks.facebookShare} target="_blank" rel="noopener noreferrer" aria-label="Compartir PV Metals Company en Facebook" title="Compartir en Facebook">
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.2H10V21h3.4Z" fill="currentColor" /></svg>
      </a>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-identity">
            <a className="footer-brand" href="#inicio" aria-label="PV Metals Company, volver al inicio">
              <Image src={siteAsset("/images/pv-isotype-color-dark.svg")} alt="" width={58} height={76} unoptimized />
              <span aria-hidden="true">METALS<br />COMPANY</span>
            </a>
            <p>Especialistas en refinación de plata de alta pureza, producción de granalla y lingotes, y servicios metalúrgicos de precisión. Comprometidos con la calidad, la innovación y la confianza en cada proceso.</p>
          </div>
          <nav className="footer-explore" aria-label="Explorar">
            <h2>Explorar</h2>
            <ul>{footerNavigation.map(({ label, href }) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
          </nav>
          <div className="footer-contact">
            <h2>Contacto</h2>
            <address>{siteContact.address}</address>
            <a className="footer-whatsapp" href={siteContact.commercialWhatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contactar al equipo comercial de PV Metals Company por WhatsApp">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1l-.7.8c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.3.2-.3.6-1 .1-.2 0-.4 0-.5l-.7-1.6c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.3s1 2.6 1.1 2.7a9 9 0 0 0 3.4 3.2c2.2 1 3.1 1 4.2.9.7-.1 1.3-.6 1.5-1 .2-.4.2-.8.2-1s-.2-.3-.4-.4Z"/></svg>
              <span><small>Escríbenos por WhatsApp</small><strong>Contactar ahora <span aria-hidden="true">↗</span></strong></span>
            </a>
            <p className="footer-contact-note">Atención comercial directa</p>
          </div>
          <nav className="footer-social" aria-label="Redes sociales">
            <h2>Redes Sociales</h2>
            <div className="footer-social-links">
              <a href={socialLinks.facebookProfile} target="_blank" rel="noopener noreferrer" aria-label="Facebook de PV Metals Company">
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M13.5 21v-7.4H16l.4-2.9h-2.9V8.8c0-.8.2-1.4 1.5-1.4h1.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.9v2.9h2.5V21h3.1Z" fill="currentColor" /></svg>
              </a>
              <a href={socialLinks.instagramProfile} target="_blank" rel="noopener noreferrer" aria-label="Instagram de PV Metals Company"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.7" r="1" fill="currentColor" /></svg></a>
              <a href={socialLinks.tiktokProfile} target="_blank" rel="noopener noreferrer" aria-label="TikTok de PV Metals Company"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M16.6 2c.2 2.1 1.4 3.4 3.4 3.5v3.1a8.5 8.5 0 0 1-3.4-.8v6.4a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.2a3 3 0 1 0 1.8 2.9V2h3.2Z" /></svg></a>
            </div>
            <p>Conoce más sobre nuestra empresa.</p>
          </nav>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal"><p>© 2026 PV Metals Company. Todos los derechos reservados.</p><VisitorCounter /><a href="#inicio">Volver arriba ↑</a></div>
          <div className="footer-author"><span>Diseño y desarrollo web por:</span><a href={siteContact.author} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Ing. Santiago Limberth Caballero Navia">Ing. Santiago Limberth Caballero Navia</a><a href="https://impulso365.dev/" target="_blank" rel="noopener noreferrer">IMPULSO 365</a></div>
        </div>
      </footer>
    </>
  );
}
