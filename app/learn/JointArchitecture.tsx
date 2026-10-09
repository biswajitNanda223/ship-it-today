"use client";

import { useEffect, useRef, useState } from "react";
import type { DiagramKind } from "./academy-data";

type Node = { name: string; detail: string };

export function JointArchitecture({ nodes, kind, activeFrame }: { nodes: Node[]; kind: DiagramKind; activeFrame: number }) {
  const host = useRef<HTMLDivElement>(null);
  const graphRef = useRef<import("@joint/core").dia.Graph | null>(null);
  const cellsRef = useRef<import("@joint/core").dia.Element[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let paper: import("@joint/core").dia.Paper | undefined;
    let observer: ResizeObserver | undefined;
    let disposed = false;

    async function draw() {
      const joint = await import("@joint/core");
      if (!host.current || disposed) return;
      const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
      graphRef.current = graph;

      const render = () => {
        if (!host.current) return;
        paper?.remove();
        graph.clear();
        const width = Math.max(host.current.clientWidth, 320);
        const compact = width < 680;
        const columns = compact ? 2 : 3;
        const nodeWidth = compact ? Math.min(145, width / 2 - 30) : 172;
        const nodeHeight = kind === "class" ? 105 : 78;
        const gapX = (width - columns * nodeWidth) / (columns + 1);
        const rows = Math.ceil(nodes.length / columns);
        const usableHeight = compact ? Math.max(440, rows * 150) : 400;
        host.current.style.height = `${usableHeight}px`;

        paper = new joint.dia.Paper({
          el: host.current,
          model: graph,
          width,
          height: usableHeight,
          gridSize: 10,
          drawGrid: { name: "mesh", args: { color: "#ffffff0a", thickness: 1 } },
          background: { color: "transparent" },
          interactive: false,
          async: false,
          cellViewNamespace: joint.shapes,
        });

        const elements = nodes.map((node, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const reverse = row % 2 === 1;
          const visualColumn = reverse ? columns - column - 1 : column;
          const x = gapX + visualColumn * (nodeWidth + gapX);
          const y = 54 + row * (nodeHeight + 68);
          const rectangle = new joint.shapes.standard.Rectangle();
          rectangle.position(x, y);
          rectangle.resize(nodeWidth, nodeHeight);
          rectangle.attr({
            root: { class: "joint-system-node" },
            body: { fill: "#211b2b", stroke: "#655a72", strokeWidth: 1, rx: kind === "state" ? 28 : 5, ry: kind === "state" ? 28 : 5 },
            label: { text: `${String(index + 1).padStart(2, "0")}  ${node.name}\n${node.detail}`, fill: "#f8f5ff", fontFamily: "var(--font-mono)", fontSize: compact ? 8 : 9, lineHeight: 16, textWrap: { width: nodeWidth - 18, height: nodeHeight - 12, ellipsis: true } },
          });
          rectangle.addTo(graph);
          return rectangle;
        });

        cellsRef.current = elements;
        elements.slice(0, -1).forEach((source, index) => {
          const target = elements[index + 1];
          const link = new joint.shapes.standard.Link();
          link.source(source);
          link.target(target);
          link.router("manhattan", { padding: 18, step: 10 });
          link.connector("rounded", { radius: 10 });
          link.attr({ line: { class: "joint-animated-link", stroke: "#9a7cff", strokeWidth: 2, strokeDasharray: "8 6", targetMarker: { type: "path", d: "M 10 -5 0 0 10 5 z", fill: "#c8ff3d", stroke: "#c8ff3d" } } });
          link.appendLabel({ attrs: { text: { text: index % 2 === 0 ? "request" : "result", fill: "#9e96a8", fontFamily: "var(--font-mono)", fontSize: 7 }, rect: { fill: "#17131e", stroke: "none" } }, position: { distance: .5 } });
          link.addTo(graph);
          link.toBack();
        });
        setReady(true);
      };

      render();
      observer = new ResizeObserver(render);
      observer.observe(host.current);
    }

    draw();
    return () => { disposed = true; observer?.disconnect(); paper?.remove(); graphRef.current = null; cellsRef.current = []; };
  }, [nodes, kind]);

  useEffect(() => {
    cellsRef.current.forEach((cell, index) => cell.attr({ body: index === activeFrame ? { fill: "#6c42ef", stroke: "#c8ff3d", strokeWidth: 2 } : { fill: "#211b2b", stroke: "#655a72", strokeWidth: 1 }, label: { fill: index <= activeFrame ? "#ffffff" : "#aaa3b0" } }));
  }, [activeFrame, ready]);

  return <div className="joint-stage"><div ref={host} className="joint-paper" aria-hidden="true"/><ol className="sr-diagram">{nodes.map(node => <li key={node.name}><b>{node.name}</b>: {node.detail}</li>)}</ol>{!ready && <div className="joint-loading"><i/><span>Building architecture graph…</span></div>}<div className="joint-legend"><span><i className="request"/>REQUEST PATH</span><span><i className="active"/>ACTIVE COMPONENT</span><span>ARROWS SHOW DATA DIRECTION</span></div></div>;
}
