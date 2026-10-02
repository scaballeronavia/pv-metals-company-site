"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { siteAsset } from "@/lib/site-asset";

const MetalSceneCanvas = dynamic(() => import("./MetalSceneCanvas"), { ssr: false });

export default function HeroScene() {
  const stage = useRef<HTMLDivElement>(null);
  const [canRender, setCanRender] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 680px)");
    let frame = 0;
    let detectionFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const updateConditions = () => {
      setReducedMotion(motion.matches);
      setCompact(width.matches);
      setActive(!document.hidden);
      if (motion.matches || width.matches) {
        stage.current?.style.setProperty("--ingot-x", "0px");
        stage.current?.style.setProperty("--ingot-y", "0px");
        stage.current?.style.setProperty("--ingot-tilt", "0deg");
      }
    };

    const updateProgress = () => {
      frame = 0;
      const story = document.getElementById("story");
      if (!story) return;
      const travel = Math.max(1, story.offsetHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, -story.getBoundingClientRect().top / travel));
      setProgress((previous) => Math.abs(previous - next) > 0.001 ? next : previous);
    };

    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };

    const updatePointer = (event: PointerEvent) => {
      if (motion.matches || width.matches || document.hidden) return;
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        stage.current?.style.setProperty("--ingot-x", `${pointerX * 54}px`);
        stage.current?.style.setProperty("--ingot-y", `${pointerY * 34}px`);
        stage.current?.style.setProperty("--ingot-tilt", `${pointerX * 7}deg`);
      });
    };

    updateConditions();
    updateProgress();
    detectionFrame = requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
        setCanRender(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setCanRender(false);
      }
    });

    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    motion.addEventListener("change", updateConditions);
    width.addEventListener("change", updateConditions);
    document.addEventListener("visibilitychange", updateConditions);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(detectionFrame);
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      window.removeEventListener("pointermove", updatePointer);
      motion.removeEventListener("change", updateConditions);
      width.removeEventListener("change", updateConditions);
      document.removeEventListener("visibilitychange", updateConditions);
    };
  }, []);

  const heroOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.09) / 0.11));
  const detailOpacity = Math.min(1, Math.max(0, (progress - 0.64) / 0.13)) * Math.max(0, 1 - Math.max(0, (progress - 0.9) / 0.1));
  const contactOpacity = Math.min(1, Math.max(0, (progress - 0.87) / 0.12));

  return (
    <div ref={stage} className="scene-shell">
      <div className="stage-visual stage-visual-ingot" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: heroOpacity, transform: reducedMotion ? undefined : `scale(${1 + Math.min(progress, 0.25) * 0.16})` }} />
      <div className="stage-visual stage-visual-ingot-empty" style={{ backgroundImage: `url("${siteAsset("/images/ingot-stage-empty.jpg")}")` }} />
      <div className="stage-visual stage-visual-liquid" style={{ backgroundImage: `url("${siteAsset("/images/liquid-silver-concept.jpg")}")`, opacity: Math.min(1, Math.max(0, (progress - 0.1) / 0.1)) * Math.max(0, 1 - Math.max(0, (progress - 0.34) / 0.1)), transform: reducedMotion ? undefined : `scale(${1.08 - Math.max(0, progress - 0.14) * 0.12})` }} />
      <div className="stage-visual stage-visual-industry" style={{ backgroundImage: `url("${siteAsset("/images/industrial-concept.jpg")}")`, opacity: Math.min(1, Math.max(0, (progress - 0.35) / 0.12,)) * Math.max(0, 1 - Math.max(0, (progress - 0.61) / 0.12)), transform: reducedMotion ? undefined : `scale(${1.08 - Math.max(0, progress - 0.35) * 0.16})` }} />
      <div className="stage-visual stage-visual-detail" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: detailOpacity, transform: reducedMotion ? undefined : `scale(${1 + Math.max(0, progress - 0.64) * 0.12})` }} />
      <div className="stage-visual stage-visual-contact" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: contactOpacity, transform: reducedMotion ? undefined : `scale(${1 + Math.max(0, progress - 0.87) * 0.14})` }} />
      <div className="stage-ingot-cutout" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: heroOpacity, transform: reducedMotion ? undefined : compact ? `translateX(-50%) translateY(${-Math.min(progress, 0.25) * 25}px) scale(${1 + Math.min(progress, 0.25) * 0.24})` : `translate(-50%,-50%) translate3d(var(--ingot-x, 0px),calc(var(--ingot-y, 0px) - ${Math.min(progress, 0.25) * 28}px),60px) rotateY(var(--ingot-tilt, 0deg)) scale(${1 + Math.min(progress, 0.25) * 0.24})` }} />
      {canRender && progress > 0.07 && progress < 0.49 ? <MetalSceneCanvas progress={progress} reducedMotion={reducedMotion} compact={compact} active={active} /> : null}
      <div className="story-progress"><span style={{ transform: "scaleY(" + Math.max(progress, 0.02) + ")" }} /></div>
      <span className="stage-coordinate">PV / AG / 47</span>
    </div>
  );
}
