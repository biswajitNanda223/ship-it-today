"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fade } from "react-awesome-reveal";
import { Boxes, CloudCog, DatabaseZap, Network, RadioTower } from "lucide-react";

const orbitalNodes = [
  { label: "EDGE", icon: RadioTower, className: "core-node edge" },
  { label: "API", icon: Network, className: "core-node api" },
  { label: "DATA", icon: DatabaseZap, className: "core-node data" },
  { label: "CLOUD", icon: CloudCog, className: "core-node cloud" },
];

export function FuturisticSystemCore() {
  const reducedMotion = useReducedMotion();

  return (
    <Fade triggerOnce duration={680} fraction={0.22} className="future-core-reveal">
      <section className="future-core" aria-label="Live three-dimensional system map">
        <div className="future-core-copy">
          <span>LIVE ARCHITECTURE / 04 REGIONS</span>
          <strong>Watch a request become a system.</strong>
          <small>Edge → API → compute → cache → data</small>
        </div>

        <div className="core-scene" aria-hidden="true">
          <motion.div
            className="core-orbit orbit-outer"
            animate={reducedMotion ? undefined : { rotateX: [68, 72, 68], rotateZ: 360 }}
            transition={{
              rotateZ: { duration: 24, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="core-orbit orbit-inner"
            animate={reducedMotion ? undefined : { rotateX: [76, 70, 76], rotateZ: -360 }}
            transition={{
              rotateZ: { duration: 17, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="core-cube"
            animate={
              reducedMotion ? undefined : { rotateX: [12, 28, 12], rotateY: 360, y: [0, -8, 0] }
            }
            transition={{
              rotateY: { duration: 14, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="cube-face cube-front">
              <Boxes size={34} strokeWidth={1.6} />
            </div>
            <div className="cube-face cube-back">
              <Boxes size={34} strokeWidth={1.6} />
            </div>
            <div className="cube-face cube-left" />
            <div className="cube-face cube-right" />
            <div className="cube-face cube-top" />
            <div className="cube-face cube-bottom" />
          </motion.div>

          {orbitalNodes.map(({ label, icon: Icon, className }, index) => (
            <motion.div
              className={className}
              key={label}
              animate={reducedMotion ? undefined : { y: [0, index % 2 ? 7 : -7, 0] }}
              transition={{ duration: 3 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </motion.div>
          ))}
          <div className="core-beam beam-one" />
          <div className="core-beam beam-two" />
          <div className="core-beam beam-three" />
        </div>

        <div className="future-core-metrics">
          <span>
            <b>18ms</b> EDGE
          </span>
          <span>
            <b>99.99%</b> SLO
          </span>
          <span>
            <b>42K/s</b> EVENTS
          </span>
        </div>
      </section>
    </Fade>
  );
}
