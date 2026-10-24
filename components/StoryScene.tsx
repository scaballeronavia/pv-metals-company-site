"use client";

import { useEffect, useRef, useState } from "react";
import { siteAsset } from "@/lib/site-asset";

const chapterIds = ["inicio", "materia", "transformacion", "toll", "precision", "productos", "contacto"] as const;
type StoryPosition = { chapter: number; progress: number; total: number };
const initialPosition: StoryPosition = { chapter: 0, progress: 0, total: 0 };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function StoryScene() {
  const stage = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<StoryPosition>(initialPosition);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 680px)");
    const story = document.getElementById("story");
    const chapters = chapterIds.map((id) => document.getElementById(id));
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let disposed = false;

    const updateConditions = () => {
      setReducedMotion(motion.matches);
      setCompact(mobile.matches);
      if (motion.matches || mobile.matches) {
        stage.current?.style.setProperty("--ingot-x", "0px");
        stage.current?.style.setProperty("--ingot-y", "0px");
        stage.current?.style.setProperty("--ingot-tilt", "0deg");
      }
    };
    const updateScroll = () => {
      scrollFrame = 0;
      if (!story) return;
      const viewport = window.innerHeight;
      const anchor = viewport * 0.5;
      let chapter = 0;
      for (let index = 1; index < chapters.length; index++) {
        const rect = chapters[index]?.getBoundingClientRect();
        if (rect && rect.top <= anchor) chapter = index;
      }
      const current = chapters[chapter]?.getBoundingClientRect();
      const storyRect = story.getBoundingClientRect();
      const next: StoryPosition = {
        chapter,
        progress: current ? clamp((anchor - current.top) / Math.max(1, current.height)) : 0,
        total: clamp(-storyRect.top / Math.max(1, storyRect.height - viewport)),
      };
      setPosition((previous) => previous.chapter === next.chapter
        && Math.abs(previous.progress - next.progress) < 0.008
        && Math.abs(previous.total - next.total) < 0.008
        ? previous : next);
    };
    const scheduleScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    const updatePointer = (event: PointerEvent) => {
      if (motion.matches || mobile.matches || document.hidden || stage.current?.dataset.storyChapter !== "0") return;
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
    updateScroll();
    const observer = story ? new ResizeObserver(scheduleScroll) : null;
    if (story) observer?.observe(story);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    motion.addEventListener("change", updateConditions);
    mobile.addEventListener("change", updateConditions);
    document.fonts?.ready.then(() => { if (!disposed) scheduleScroll(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      window.removeEventListener("pointermove", updatePointer);
      motion.removeEventListener("change", updateConditions);
      mobile.removeEventListener("change", updateConditions);
    };
  }, []);

  const chapter = position.chapter;
  const heroOpacity = chapter === 0 ? 1 : 0;
  const rawBlend = clamp((position.progress - 0.42) / 0.55);
  const chapterBlend = reducedMotion ? 0 : rawBlend * rawBlend * (3 - 2 * rawBlend);
  const machineTravel = reducedMotion || chapter !== 2 ? 0 : position.progress - 0.5;
  const machineTransform = reducedMotion ? "none" : `translate3d(0,${-26 * machineTravel * (compact ? 0.7 : 1)}px,0) rotateY(${8 * machineTravel * (compact ? 0.6 : 1)}deg) scale(1.035)`;
  const granallaOpacity = chapter === 1 || chapter === 4 || chapter === 5 ? 1 : chapter === 3 ? chapterBlend : 0;
  const granallaOffset = chapter === 1 ? (reducedMotion ? 18 : 14 + 4 * position.progress) : chapter === 4 ? -30 - 6 * chapterBlend : chapter === 5 ? 0 : -18;
  const granallaTilt = reducedMotion ? 0 : chapter === 1 ? -3 + 6 * position.progress : chapter === 4 ? -3 + 6 * chapterBlend : chapter === 5 ? 3 + position.progress : -3;
  const productTravel = reducedMotion ? 0 : position.progress - 0.5;

  return (
    <div ref={stage} className="scene-shell" data-story-chapter={chapter}>
      <div className="stage-visual stage-visual-ingot" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-silver-brand.webp")}")`, opacity: heroOpacity }} />
      <div className="stage-visual stage-visual-ingot-empty" style={{ backgroundImage: `url("${siteAsset("/images/ingot-stage-empty.jpg")}")` }} />
      <div className="stage-visual stage-visual-matter" style={{ opacity: chapter === 1 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-liquid" style={{ backgroundImage: `url("${siteAsset("/images/granalla-machine-concept.webp")}")`, opacity: chapter === 2 ? 1 : 0, transform: machineTransform }} />
      <div className="stage-visual stage-visual-industry" style={{ backgroundImage: `url("${siteAsset("/images/industrial-concept.jpg")}")`, opacity: chapter === 3 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-products" style={{ opacity: chapter === 4 || chapter === 5 ? 1 : 0 }} />
      {(chapter === 1 || chapter === 3 || chapter === 4 || chapter === 5) && <div className={`stage-visual stage-visual-granalla${chapter === 5 ? " is-product" : ""}`} style={{ backgroundImage: `url("${siteAsset("/images/granalla-silver-cutout.webp")}")`, opacity: granallaOpacity, transform: `translate3d(calc(${compact ? 0 : granallaOffset}vw + var(--granalla-pureza-shift, 0vw)),${chapter === 5 ? -18 * productTravel : 0}px,0) rotateY(${compact ? granallaTilt * 0.65 : granallaTilt}deg)` }} />}
      {chapter === 5 && <div className="stage-product-ingot" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-silver-brand-cutout.webp")}")`, transform: reducedMotion ? "none" : `translate3d(0,${-24 * productTravel}px,0) rotateY(${6 * productTravel}deg)` }} />}
      <div className="stage-visual stage-visual-contact" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-silver-brand.webp")}")`, opacity: chapter === 6 ? 1 : 0 }} />
      <div className="stage-ingot-cutout" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-silver-brand.webp")}")`, opacity: heroOpacity, transform: reducedMotion ? undefined : compact ? "translateX(-50%)" : "translate(-50%,-50%) translate3d(var(--ingot-x, 0px),var(--ingot-y, 0px),60px) rotateY(var(--ingot-tilt, 0deg))" }} />
      <div className="story-progress"><span style={{ transform: `scaleY(${Math.max(position.total, 0.02)})` }} /></div>
      <span className="stage-coordinate">PV / AG / 47</span>
    </div>
  );
}
