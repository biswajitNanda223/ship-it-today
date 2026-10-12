"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type HyperspeedProps = {
  className?: string;
  speed?: number;
  boost?: number;
};

const COLORS = [
  new THREE.Color("#6c42ef"),
  new THREE.Color("#a98cff"),
  new THREE.Color("#c8ff3d"),
  new THREE.Color("#2bd9ff"),
];

export function ReactBitsHyperspeed({ className = "", speed = 24, boost = 2.4 }: HyperspeedProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0a12");
    scene.fog = new THREE.FogExp2("#0d0a12", 0.022);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
    camera.position.set(0, 2.1, 7);
    camera.lookAt(0, 0.2, -55);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });
    const compactDevice = window.matchMedia("(max-width: 720px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactDevice ? 1 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 220),
      new THREE.MeshBasicMaterial({ color: "#130f1c" }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.18, -96);
    scene.add(road);

    const median = new THREE.Mesh(
      new THREE.PlaneGeometry(0.13, 220),
      new THREE.MeshBasicMaterial({ color: "#c8ff3d" }),
    );
    median.rotation.x = -Math.PI / 2;
    median.position.set(0, -0.16, -96);
    scene.add(median);

    const streakCount = compactDevice ? 58 : 96;
    const geometry = new THREE.BoxGeometry(0.055, 0.045, 1);
    const material = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      toneMapped: false,
    });
    const streaks = new THREE.InstancedMesh(geometry, material, streakCount);
    const dummy = new THREE.Object3D();
    const positions = Array.from({ length: streakCount }, (_, index) => ({
      x: (index % 2 ? 1 : -1) * (2.1 + ((index * 37) % 100) / 18),
      y: 0.05 + ((index * 11) % 9) / 23,
      z: -4 - ((index * 43) % 190),
      length: 1.5 + ((index * 19) % 24) / 2.4,
      phase: ((index * 13) % 40) / 40,
    }));

    positions.forEach((position, index) => {
      dummy.position.set(position.x, position.y, position.z);
      dummy.scale.set(1, 1, position.length);
      dummy.updateMatrix();
      streaks.setMatrixAt(index, dummy.matrix);
      streaks.setColorAt(index, COLORS[index % COLORS.length]);
    });
    streaks.instanceMatrix.needsUpdate = true;
    if (streaks.instanceColor) streaks.instanceColor.needsUpdate = true;
    scene.add(streaks);

    const laneMaterial = new THREE.MeshBasicMaterial({
      color: "#463760",
      transparent: true,
      opacity: 0.58,
    });
    [-4.2, -2.1, 2.1, 4.2].forEach((x) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 220), laneMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, -0.15, -96);
      scene.add(line);
    });

    let boosted = false;
    let currentSpeed = speed;
    let previous = performance.now();
    let lastFrame = 0;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const setBoost = (value: boolean) => {
      boosted = value;
    };

    const onPointerDown = () => setBoost(true);
    const onPointerUp = () => setBoost(false);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const render = (now: number) => {
      if (!visible || document.hidden || now - lastFrame < 30) return;
      lastFrame = now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const targetSpeed = boosted ? speed * boost : speed;
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      camera.fov += ((boosted ? 72 : 58) - camera.fov) * 0.06;
      camera.updateProjectionMatrix();

      positions.forEach((position, index) => {
        position.z += currentSpeed * delta * (0.72 + position.phase);
        if (position.z > 9) position.z = -190 - position.phase * 35;
        dummy.position.set(
          position.x + Math.sin(now * 0.0005 + position.phase * 8) * 0.16,
          position.y,
          position.z,
        );
        dummy.scale.set(boosted ? 1.3 : 1, 1, position.length * (boosted ? 2.15 : 1));
        dummy.updateMatrix();
        streaks.setMatrixAt(index, dummy.matrix);
      });
      streaks.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(render);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previous = performance.now();
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(container);

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const objectMaterial = object.material;
        if (Array.isArray(objectMaterial)) {
          objectMaterial.forEach((entry) => entry.dispose());
        } else {
          objectMaterial.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [boost, speed]);

  return <div ref={host} className={`react-bits-hyperspeed ${className}`} aria-hidden="true" />;
}
