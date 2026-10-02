"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const Ingot360Canvas = dynamic(() => import("./Ingot360Canvas"), { ssr: false });

const initialPitch = 0;

export default function HeroIngot3D() {
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(true);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(initialPitch);

  useEffect(() => {
    const width = window.matchMedia("(max-width: 680px)");
    const tablet = window.matchMedia("(max-width: 1120px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setCompact(width.matches);
      setNarrow(tablet.matches);
      setReducedMotion(motion.matches);
    };
    update();
    width.addEventListener("change", update);
    tablet.addEventListener("change", update);
    motion.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => {
      const inHero = entry.intersectionRatio > 0.25;
      setVisible(inHero);
      if (!inHero) setReady(false);
    }, { threshold: 0.25 });
    const hero = document.getElementById("inicio");
    if (hero) observer.observe(hero);
    const detectionFrame = requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
        setWebgl(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setWebgl(false);
      }
    });
    return () => {
      cancelAnimationFrame(detectionFrame);
      width.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!webgl || !ready || event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setYaw((current) => current + dx * 0.012);
    setPitch((current) => Math.max(-0.68, Math.min(0.58, current + dy * 0.008)));
  };

  const endDrag = () => {
    drag.current = null;
    area.current?.classList.remove("is-dragging");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft": setYaw((current) => current - Math.PI / 12); break;
      case "ArrowRight": setYaw((current) => current + Math.PI / 12); break;
      case "ArrowUp": setPitch((current) => Math.max(-0.68, current - 0.1)); break;
      case "ArrowDown": setPitch((current) => Math.min(0.58, current + 0.1)); break;
      case "Home": setYaw(0); setPitch(initialPitch); break;
      default: return;
    }
    event.preventDefault();
  };

  if (!webgl || !visible) return null;

  return (
    <div
      ref={area}
      className={`hero-ingot-interaction${ready ? " hero-ingot-ready" : ""}`}
      role="group"
      tabIndex={0}
      data-rotation-deg={Math.round(yaw * 180 / Math.PI)}
      aria-label="Lingote conceptual de PV Metals en 3D"
      aria-describedby="ingot-instructions"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={onKeyDown}
    >
      <Ingot360Canvas key={compact ? "compact" : narrow ? "narrow" : "wide"} yaw={yaw} pitch={pitch} reducedMotion={reducedMotion} compact={compact} narrow={narrow} onReady={onReady} />
      <div className="hero-ingot-controls">
        <p id="ingot-instructions">{compact ? "Desliza" : "Arrastra"} para girar 360° <span aria-hidden="true">↔</span></p>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => { setYaw(0); setPitch(initialPitch); }}>
          Vista inicial
        </button>
      </div>
    </div>
  );
}
