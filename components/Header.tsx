"use client";

import { useState } from "react";
import { siteAsset } from "@/lib/site-asset";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#inicio" aria-label="PV Metals Company, inicio" onClick={() => setOpen(false)}>
          <span className="brand-isotype" aria-hidden="true" style={{ backgroundImage: `url("${siteAsset("/images/pv-isotype-color-dark.svg")}")` }} />
          <span className="brand-name">METALS<br />COMPANY</span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
        <nav id="primary-nav" className={open ? "primary-nav is-open" : "primary-nav"} aria-label="Navegación principal">
          <a href="#productos" onClick={() => setOpen(false)}>Productos</a>
          <a href="#toll" onClick={() => setOpen(false)}>Servicio Toll</a>
          <a href="#precision" onClick={() => setOpen(false)}>Precisión</a>
          <a href="#contacto" onClick={() => setOpen(false)}>Contacto</a>
        </nav>
        <a className="header-cta" href="https://wa.me/59176486230?text=Hola%2C%20quisiera%20solicitar%20una%20cotizaci%C3%B3n" target="_blank" rel="noopener noreferrer">Solicitar cotización <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  );
}
