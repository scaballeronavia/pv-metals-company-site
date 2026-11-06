"use client";

import { useEffect } from "react";
import { animate } from "motion/react";

type EditorialRevealProps = { sectionId: string };

export default function EditorialReveal({ sectionId }: EditorialRevealProps) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section || !window.IntersectionObserver) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active: Array<{ stop: () => void; element: HTMLElement }> = [];
    const settle = () => active.forEach(({ stop, element }) => {
      stop();
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
    });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reducedMotion.matches) continue;

        const element = entry.target as HTMLElement;
        const order = Number(element.dataset.editorialReveal ?? 0);
        const animation = animate(element, { opacity: [0.62, 1], y: [order === 2 ? 18 : 24, 0] }, {
          duration: order === 0 ? 0.86 : 0.7,
          delay: Math.min(order, 2) * 0.1,
          ease: [0.22, 1, 0.36, 1],
        });
        active.push({ stop: () => animation.stop(), element });
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    section.querySelectorAll<HTMLElement>("[data-editorial-reveal]").forEach((element) => observer.observe(element));
    const stopMotion = () => { if (reducedMotion.matches) settle(); };
    reducedMotion.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", stopMotion);
      settle();
    };
  }, [sectionId]);

  return null;
}
