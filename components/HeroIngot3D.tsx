"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const Ingot360Canvas = dynamic(() => import("./Ingot360Canvas"), { ssr: false });
const initialYaw = -0.28;
const initialPitch = 0;

class CanvasBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type DragState = { pointerId: number; x: number; y: number };
type TouchState = { identifier: number; x: number; startX: number; startY: number; active: boolean };

export default function HeroIngot3D() {
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const touch = useRef<TouchState | null>(null);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [compact, setCompact] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [yaw, setYaw] = useState(initialYaw);
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
      const inHero = entry.intersectionRatio > 0.5;
      setVisible(inHero);
      if (!inHero) setReady(false);
    }, { threshold: 0.5 });
    const hero = document.getElementById("inicio");
    if (hero) observer.observe(hero);
    const detectionFrame = requestAnimationFrame(() => {
      setWebgl(Boolean(window.WebGL2RenderingContext || window.WebGLRenderingContext));
    });
    return () => {
      cancelAnimationFrame(detectionFrame);
      width.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!webgl || !visible || ready || failed || contextLost) return;
    const timer = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(timer);
  }, [webgl, visible, ready, failed, contextLost, retryKey]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setReady(false); setFailed(true); }, []);
  const onContextLost = useCallback(() => { setReady(false); setContextLost(true); }, []);
  const onContextRestored = useCallback(() => {
    setReady(false);
    setContextLost(false);
    setRetryKey((current) => current + 1);
  }, []);
  const retry = () => {
    setReady(false);
    setFailed(false);
    setContextLost(false);
    setRetryKey((current) => current + 1);
  };

  const active = webgl && visible && ready && !failed && !contextLost;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.x = event.clientX;
    current.y = event.clientY;
    setYaw((value) => value + dx * 0.012);
    setPitch((value) => Math.max(-0.68, Math.min(0.58, value + dy * 0.008)));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    area.current?.classList.remove("is-dragging");
  };

  const onLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) endDrag(event);
  };

  const endTouch = () => {
    touch.current = null;
    area.current?.classList.remove("is-dragging");
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!active || event.touches.length !== 1) { endTouch(); return; }
    const point = event.touches[0];
    touch.current = { identifier: point.identifier, x: point.clientX, startX: point.clientX, startY: point.clientY, active: false };
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const current = touch.current;
    if (!current || event.touches.length !== 1) { endTouch(); return; }
    const point = event.touches[0];
    if (point.identifier !== current.identifier) return;
    if (!current.active) {
      const horizontal = Math.abs(point.clientX - current.startX);
      const vertical = Math.abs(point.clientY - current.startY);
      if (vertical > 8 && vertical > horizontal) { endTouch(); return; }
      if (horizontal < 6 || horizontal < vertical * 1.2) return;
      current.active = true;
      event.currentTarget.classList.add("is-dragging");
    }
    const dx = point.clientX - current.x;
    current.x = point.clientX;
    setYaw((value) => value + dx * 0.012);
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const current = touch.current;
    if (current && Array.from(event.changedTouches).some((point) => point.identifier === current.identifier)) endTouch();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!active || event.target !== event.currentTarget) return;
    switch (event.key) {
      case "ArrowLeft": setYaw((value) => value - Math.PI / 12); break;
      case "ArrowRight": setYaw((value) => value + Math.PI / 12); break;
      case "ArrowUp": setPitch((value) => Math.max(-0.68, value - 0.1)); break;
      case "ArrowDown": setPitch((value) => Math.min(0.58, value + 0.1)); break;
      case "Home": setYaw(initialYaw); setPitch(initialPitch); break;
      default: return;
    }
    event.preventDefault();
  };

  if (!visible || !webgl) return null;

  return (
    <>
      {!failed && (
        <div
          ref={area}
          className={`hero-ingot-interaction${active ? " hero-ingot-ready" : ""}`}
          role={active ? "group" : undefined}
          tabIndex={active ? 0 : -1}
          data-rotation-deg={Math.round((yaw - initialYaw) * 180 / Math.PI)}
          aria-label={active ? "Lingote conceptual de PV Metals en 3D" : undefined}
          aria-describedby={active ? "ingot-instructions" : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={onLostPointerCapture}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={onKeyDown}
        >
          <CanvasBoundary key={retryKey} onError={onError}>
            <Ingot360Canvas yaw={yaw} pitch={pitch} reducedMotion={reducedMotion} compact={compact} narrow={narrow} onReady={onReady} onContextLost={onContextLost} onContextRestored={onContextRestored} />
          </CanvasBoundary>
          {active && (
            <div className="hero-ingot-controls">
              <p id="ingot-instructions">{compact ? "Desliza" : "Arrastra"} para girar 360° <span aria-hidden="true">↔</span><span className="sr-only"> Usa las flechas del teclado para girar o la tecla Inicio para restablecer la vista.</span></p>
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => { setYaw(initialYaw); setPitch(initialPitch); }}>
                Vista inicial
              </button>
            </div>
          )}
        </div>
      )}
      {(failed || contextLost) && (
        <div className="hero-3d-status" role="status">
          <span>Vista 3D no disponible. Se muestra la imagen conceptual.</span>
          <button type="button" onClick={retry}>Reintentar 3D</button>
        </div>
      )}
    </>
  );
}
