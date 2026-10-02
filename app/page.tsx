import Header from "@/components/Header";
import HeroIngot3D from "@/components/HeroIngot3D";
import HeroIntroMotion from "@/components/HeroIntroMotion";
import HeroScene from "@/components/HeroScene";

const quoteLink = "https://wa.me/59176486230?text=Hola%2C%20quisiera%20solicitar%20una%20cotizaci%C3%B3n%20a%20PV%20Metals%20Company";
const tollLink = "https://wa.me/59176486230?text=Hola%2C%20quisiera%20consultar%20sobre%20el%20servicio%20Toll";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <main id="contenido">
        <div className="story" id="story">
          <div className="story-stage" aria-hidden="true"><HeroScene /></div>

          <section className="chapter chapter-hero" id="inicio" aria-labelledby="hero-title">
            <div className="chapter-inner">
              <HeroIngot3D />
              <HeroIntroMotion quoteLink={quoteLink} />
              <p className="hero-side-note">Imagen conceptual del lingote</p>
              <p className="scroll-cue"><span aria-hidden="true" /> Desliza para explorar</p>
            </div>
          </section>

          <section className="chapter chapter-products chapter-align-right" id="productos" aria-labelledby="products-title">
            <div className="chapter-inner">
              <p className="concept-caption">Visualización conceptual de metal líquido</p>
              <div className="chapter-copy">
                <h2 id="products-title">Una materia.<br /><em>Dos formas.</em></h2>
                <p className="chapter-lead">Plata refinada en presentaciones pensadas para distintas necesidades comerciales.</p>
                <dl className="line-list">
                  <div><dt>Granalla de plata</dt><dd>Presentación de plata refinada en granalla.</dd></div>
                  <div><dt>Lingotes</dt><dd>De aproximadamente 10 kg por unidad.</dd></div>
                </dl>
                <a className="text-link" href={quoteLink} target="_blank" rel="noopener noreferrer">Consultar disponibilidad <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </section>

          <section className="chapter chapter-toll" id="toll" aria-labelledby="toll-title">
            <div className="chapter-inner">
              <p className="concept-caption">Visualización conceptual del entorno industrial</p>
              <div className="chapter-copy">
                <h2 id="toll-title">Tu material.<br /><em>Nuestra especialidad.</em></h2>
                <p className="chapter-lead">Refinamos concentrado de óxido de plata del cliente en nuestras instalaciones.</p>
                <div className="feature-rule"><strong>6–10 días</strong><span>Tiempo estimado, dependiendo de la ley del concentrado.</span></div>
                <a className="text-link" href={tollLink} target="_blank" rel="noopener noreferrer">Consultar servicio Toll <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </section>

          <section className="chapter chapter-facts chapter-align-right" id="precision" aria-labelledby="facts-title">
            <div className="chapter-inner">
              <div className="chapter-copy">
                <h2 id="facts-title">El valor está<br /><em>en el detalle.</em></h2>
                <div className="purity"><strong>Hasta 99,9<span>%</span></strong><p>Pureza respaldada por análisis de varios lotes producidos.</p></div>
                <p className="availability">Volumen habitual desde 50 kg. Cantidades menores según disponibilidad.</p>
              </div>
            </div>
          </section>

          <section className="chapter chapter-contact" id="contacto" aria-labelledby="contact-title">
            <div className="chapter-inner">
              <div className="chapter-copy">
                <h2 id="contact-title">Hablemos de<br /><em>tu próximo lote.</em></h2>
                <p className="chapter-lead">Atención en Cochabamba y a nivel nacional. Cuéntanos qué material tienes y conversemos sobre tus necesidades.</p>
                <div className="contact-actions">
                  <a className="button-primary" href={quoteLink} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp <span aria-hidden="true">↗</span></a>
                  <a className="button-secondary" href="mailto:pvmetalscompany@gmail.com?subject=Consulta%20PV%20Metals%20Company">Enviar un correo <span aria-hidden="true">↗</span></a>
                </div>
                <address>Av. Gualberto Villarroel s/n, esquina Pasaje sin nombre, Zona El Abra, Cochabamba, Bolivia.</address>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <span>PV METALS COMPANY</span>
        <span>COCHABAMBA · BOLIVIA</span>
        <span className="footer-credit">Hecho por <a href="https://wa.me/59179391508?text=Hola%2C%20Ing.%20Santiago%2C%20vi%20el%20sitio%20de%20PV%20Metals%20Company" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Ing. Santiago Caballero">Ing. Santiago Caballero</a></span>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </>
  );
}
