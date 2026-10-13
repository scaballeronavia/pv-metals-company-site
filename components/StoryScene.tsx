"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { siteAsset } from "@/lib/site-asset";

const JourneySceneCanvas = dynamic(() => import("./JourneySceneCanvas"), { ssr: false });
const chapterIds = ["inicio", "materia", "transformacion", "toll", "precision", "productos", "contacto"] as const;
type StoryPosition = { chapter: number; progress: number; total: number; heroCleared: boolean; withinStory: boolean };
const initialPosition: StoryPosition = { chapter: 0, progress: 0, total: 0, heroCleared: false, withinStory: true };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type JourneyLayerProps = {
  stage: number;
  progress: number;
  reducedMotion: boolean;
  compact: boolean;
  narrow: boolean;
  onError: () => void;
};

function JourneyLayer({ stage, progress, reducedMotion, compact, narrow, onError }: JourneyLayerProps) {
  const [ready, setReady] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const onContextRestored = useCallback(() => {
    setReady(false);
    setSceneKey((current) => current + 1);
  }, []);

  return (
    <div className="journey-canvas-layer" aria-hidden="true" style={{ opacity: ready ? 1 : 0 }}>
      <SceneBoundary key={sceneKey} onError={onError}>
        <JourneySceneCanvas stage={stage} progress={progress} reducedMotion={reducedMotion} compact={compact} narrow={narrow} onReady={() => setReady(true)} onContextLost={() => setReady(false)} onContextRestored={onContextRestored} />
      </SceneBoundary>
    </div>
  );
}

export default function StoryScene() {
  const stage = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<StoryPosition>(initialPosition);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compact, setCompact] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const failedAtChapter = useRef<number | null>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 680px)");
    const tablet = window.matchMedia("(max-width: 900px)");
    const story = document.getElementById("story");
    const chapters = chapterIds.map((id) => document.getElementById(id));
    const heroElement = chapters[0];
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let disposed = false;

    const updateConditions = () => {
      setReducedMotion(motion.matches);
      setCompact(mobile.matches);
      setNarrow(tablet.matches);
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
      if (failedAtChapter.current !== null && chapter !== failedAtChapter.current) {
        failedAtChapter.current = null;
        setSceneFailed(false);
      }
      const current = chapters[chapter]?.getBoundingClientRect();
      const hero = chapters[0]?.getBoundingClientRect();
      const storyRect = story.getBoundingClientRect();
      const next: StoryPosition = {
        chapter,
        progress: current ? clamp((anchor - current.top) / Math.max(1, current.height)) : 0,
        total: clamp(-storyRect.top / Math.max(1, storyRect.height - viewport)),
        heroCleared: hero ? hero.bottom <= hero.height * 0.42 && !heroElement?.querySelector("canvas") : false,
        withinStory: storyRect.bottom > 0 && storyRect.top < viewport,
      };
      setPosition((previous) => previous.chapter === next.chapter
        && Math.abs(previous.progress - next.progress) < 0.008
        && Math.abs(previous.total - next.total) < 0.008
        && previous.heroCleared === next.heroCleared
        && previous.withinStory === next.withinStory ? previous : next);
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
    const detectionFrame = requestAnimationFrame(() => setCanRender(Boolean(window.WebGL2RenderingContext || window.WebGLRenderingContext)));
    const observer = story ? new ResizeObserver(scheduleScroll) : null;
    if (story) observer?.observe(story);
    const heroObserver = heroElement ? new MutationObserver(scheduleScroll) : null;
    if (heroElement) heroObserver?.observe(heroElement, { childList: true, subtree: true });
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    motion.addEventListener("change", updateConditions);
    mobile.addEventListener("change", updateConditions);
    tablet.addEventListener("change", updateConditions);
    document.fonts?.ready.then(() => { if (!disposed) scheduleScroll(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(detectionFrame);
      observer?.disconnect();
      heroObserver?.disconnect();
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      window.removeEventListener("pointermove", updatePointer);
      motion.removeEventListener("change", updateConditions);
      mobile.removeEventListener("change", updateConditions);
      tablet.removeEventListener("change", updateConditions);
    };
  }, []);

  const onSceneError = useCallback(() => {
    failedAtChapter.current = position.chapter;
    setSceneFailed(true);
  }, [position.chapter]);
  const chapter = position.chapter;
  const heroOpacity = chapter === 0 ? 1 : 0;
  const showJourney = canRender && !sceneFailed && position.heroCleared && position.withinStory && chapter >= 1 && chapter <= 5;

  return (
    <div ref={stage} className="scene-shell" data-story-chapter={chapter}>
      <div className="stage-visual stage-visual-ingot" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: heroOpacity }} />
      <div className="stage-visual stage-visual-ingot-empty" style={{ backgroundImage: `url("${siteAsset("/images/ingot-stage-empty.jpg")}")` }} />
      <div className="stage-visual stage-visual-matter" style={{ opacity: chapter === 1 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-liquid" style={{ backgroundImage: `url("${siteAsset("/images/liquid-silver-concept.jpg")}")`, opacity: chapter === 2 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-industry" style={{ backgroundImage: `url("${siteAsset("/images/industrial-concept.jpg")}")`, opacity: chapter === 3 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-detail" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: chapter === 4 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-products" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: chapter === 5 ? 1 : 0 }} />
      <div className="stage-visual stage-visual-contact" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: chapter === 6 ? 1 : 0 }} />
      <div className="stage-ingot-cutout" style={{ backgroundImage: `url("${siteAsset("/images/pv-ingot-concept.jpg")}")`, opacity: heroOpacity, transform: reducedMotion ? undefined : compact ? "translateX(-50%)" : "translate(-50%,-50%) translate3d(var(--ingot-x, 0px),var(--ingot-y, 0px),60px) rotateY(var(--ingot-tilt, 0deg))" }} />
      {showJourney && <JourneyLayer stage={chapter - 1} progress={position.progress} reducedMotion={reducedMotion} compact={compact} narrow={narrow} onError={onSceneError} />}
      <div className="story-progress"><span style={{ transform: `scaleY(${Math.max(position.total, 0.02)})` }} /></div>
      <span className="stage-coordinate">PV / AG / 47</span>
    </div>
  );
}
