"use client";

import { MotionConfig, motion } from "motion/react";

type HeroIntroMotionProps = { quoteLink: string };

export default function HeroIntroMotion({ quoteLink }: HeroIntroMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="chapter-copy hero-copy"
        initial={{ opacity: 1, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 id="hero-title">La plata<br />toma forma<span className="period">.</span></h1>
        <p className="hero-description">Refinación especializada de plata. Lingotes, granalla y servicio Toll para concentrado de óxido de plata.</p>
        <div className="hero-actions">
          <a className="button-primary" href="#productos">Ver productos</a>
          <a className="button-secondary" href={quoteLink} target="_blank" rel="noopener noreferrer">Solicitar cotización</a>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
