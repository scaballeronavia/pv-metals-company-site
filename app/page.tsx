import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroIngot3D from "@/components/HeroIngot3D";
import HeroIntroMotion from "@/components/HeroIntroMotion";
import StoryScene from "@/components/StoryScene";
import Image from "next/image";
import { siteAsset } from "@/lib/site-asset";
import { siteContact } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <div className="story" id="story">
          <div className="story-stage" aria-hidden="true"><StoryScene /></div>

          <section className="chapter chapter-hero" id="inicio" aria-labelledby="hero-title">
            <div className="chapter-inner">
              <HeroIngot3D />
              <HeroIntroMotion quoteLink={siteContact.quote} />
              <p className="hero-side-note">Imagen conceptual del lingote</p>
              <p className="scroll-cue"><span aria-hidden="true" /> Desliza para explorar</p>
            </div>
          </section>

          <section className="chapter chapter-matter" id="materia" aria-labelledby="matter-title">
            <div className="chapter-inner">
              <p className="concept-caption">Representación conceptual de la materia</p>
              <div className="chapter-copy">
                <h2 id="matter-title">Todo empieza<br /><em>con la materia.</em></h2>
                <p className="chapter-lead">En el servicio Toll, el cliente aporta concentrado de óxido de plata para su refinación en las instalaciones de PV Metals Company.</p>
              </div>
            </div>
          </section>

          <section className="chapter chapter-transformation chapter-align-right" id="transformacion" aria-labelledby="transformation-title">
            <div className="chapter-inner">
              <p className="concept-caption">Visualización conceptual de la transformación</p>
              <div className="chapter-copy">
                <h2 id="transformation-title">El metal cambia.<br /><em>La exigencia permanece.</em></h2>
                <p className="chapter-lead">PV Metals Company se dedica a la refinación especializada de plata.</p>
              </div>
            </div>
          </section>

          <section className="chapter chapter-toll" id="toll" aria-labelledby="toll-title">
            <div className="chapter-inner">
              <p className="concept-caption">Visualización conceptual del entorno industrial</p>
              <div className="chapter-copy">
                <h2 id="toll-title">Realizamos<br /><em>Refinado de Plata</em></h2>
                <p className="chapter-lead">en nuestras instalaciones con materia prima de nuestros clientes (servicio Toll).</p>
                <div className="feature-rule"><strong>6–10 días</strong><span>Tiempo estimado, dependiendo de la ley del concentrado.</span></div>
                <a className="text-link" href={siteContact.toll} target="_blank" rel="noopener noreferrer">Consultar servicio Toll <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </section>

          <section className="chapter chapter-facts chapter-align-right" id="precision" aria-labelledby="facts-title">
            <div className="chapter-inner">
              <p className="concept-caption">Representación conceptual de plata refinada</p>
              <div className="chapter-copy">
                <h2 id="facts-title">El valor está<br /><em>en la Calidad</em></h2>
                <div className="purity"><div className="purity-value"><span>Se Garantiza</span>{" "}<strong>99,9<span>%</span></strong></div><p>Pureza respaldada por análisis de varios lotes producidos.</p></div>
                <p className="availability">Volumen habitual desde 50 kg. Cantidades menores según disponibilidad.</p>
              </div>
            </div>
          </section>

          <section className="chapter chapter-products" id="productos" aria-labelledby="products-title">
            <div className="chapter-inner">
              <p className="concept-caption">Representación conceptual de las presentaciones</p>
              <div className="product-pair" aria-hidden="true">
                <Image className="product-pair-ingot" src={siteAsset("/images/pv-ingot-silver-brand-cutout.webp")} width={1536} height={1024} alt="" unoptimized />
                <Image className="product-pair-granalla" src={siteAsset("/images/granalla-silver-cutout.webp")} width={1254} height={1254} alt="" unoptimized />
              </div>
              <div className="chapter-copy">
                <h2 id="products-title">Una materia.<br /><em>Dos formas.</em></h2>
                <p className="chapter-lead">Plata refinada en presentaciones pensadas para distintas necesidades comerciales.</p>
                <dl className="line-list">
                  <div><dt>Granalla de plata</dt><dd>Presentación de plata refinada en granalla.</dd></div>
                  <div><dt>Lingotes</dt><dd>De aproximadamente 10 kg por unidad.</dd></div>
                </dl>
                <a className="text-link" href={siteContact.quote} target="_blank" rel="noopener noreferrer">Consultar disponibilidad <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </section>

          <section className="chapter chapter-contact" id="contacto" aria-labelledby="contact-title">
            <div className="chapter-inner">
              <div className="chapter-copy">
                <h2 id="contact-title">Hablemos de<br /><em>tu próximo lote.</em></h2>
                <p className="chapter-lead">Atención a nivel local, nacional e internacional. Cuéntanos qué material tienes y conversemos sobre tus necesidades.</p>
                <div className="contact-actions">
                  <a className="button-primary" href={siteContact.quote} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp <span aria-hidden="true">↗</span></a>
                  <a className="button-secondary" href={siteContact.email}>Enviar un correo <span aria-hidden="true">↗</span></a>
                </div>
                <address>{siteContact.address}</address>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
