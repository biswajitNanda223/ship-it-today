"use client";

import { useEffect, useRef, useState } from "react";
import type { DiagramKind } from "./academy-data";

type Node = { name: string; detail: string };

export function JointArchitecture({
  nodes,
  kind,
  activeFrame,
}: {
  nodes: Node[];
  kind: DiagramKind;
  activeFrame?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const graphRef = useRef<import("@joint/core").dia.Graph | null>(null);
  const cellsRef = useRef<import("@joint/core").dia.Element[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let paper: import("@joint/core").dia.Paper | undefined;
    let observer: ResizeObserver | undefined;
    let hostElement: HTMLDivElement | null = null;
    let disposed = false;

    async function draw() {
      const joint = await import("@joint/core");
      if (!host.current || disposed) return;
      hostElement = host.current;
      const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
      graphRef.current = graph;

      let previousWidth = 0;
      const render = () => {
        if (!host.current) return;
        const measuredWidth = Math.max(host.current.clientWidth, 320);
        if (Math.abs(measuredWidth - previousWidth) < 8 && paper) return;
        previousWidth = measuredWidth;
        paper?.remove();
        graph.clear();
        const width = measuredWidth;
        const compact = width < 640;
        const tablet = width < 960;
        const columns = compact ? 1 : tablet ? 2 : 3;
        const nodeWidth = compact
          ? Math.min(340, width - 52)
          : tablet
            ? Math.min(260, width / 2 - 54)
            : Math.min(250, width / 3 - 54);
        const nodeHeight = kind === "class" ? 118 : 92;
        const gapX = (width - columns * nodeWidth) / (columns + 1);
        const rows = Math.ceil(nodes.length / columns);
        const rowGap = compact ? 54 : 76;
        const usableHeight = Math.max(430, 58 + rows * (nodeHeight + rowGap));
        host.current.style.height = `${usableHeight}px`;
        if (host.current.parentElement) {
          host.current.parentElement.style.height = `${usableHeight}px`;
        }

        paper = new joint.dia.Paper({
          el: host.current,
          model: graph,
          width,
          height: usableHeight,
          gridSize: 10,
          drawGrid: false,
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
          const y = 42 + row * (nodeHeight + rowGap);
          const rectangle = new joint.shapes.standard.Rectangle();
          rectangle.position(x, y);
          rectangle.resize(nodeWidth, nodeHeight);
          rectangle.attr({
            root: { class: "joint-system-node" },
            body: {
              fill: index % 2 ? "#272033" : "#211b2b",
              stroke: "#8f7da4",
              strokeWidth: 1.5,
              rx: kind === "state" ? 28 : 7,
              ry: kind === "state" ? 28 : 7,
            },
            label: {
              text: `${String(index + 1).padStart(2, "0")}  ${node.name}\n${node.detail}`,
              fill: "#f8f5ff",
              fontFamily: "var(--font-mono)",
              fontSize: compact ? 11 : 10,
              fontWeight: 600,
              lineHeight: 18,
              textWrap: { width: nodeWidth - 28, height: nodeHeight - 20, ellipsis: true },
            },
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
          link.attr({
            line: {
              class: "joint-animated-link",
              stroke: "#ae94ff",
              strokeWidth: 3,
              strokeLinejoin: "round",
              targetMarker: {
                type: "path",
                d: "M 12 -6 0 0 12 6 z",
                fill: "#c8ff3d",
                stroke: "#c8ff3d",
              },
            },
          });
          link.appendLabel({
            attrs: {
              text: {
                text: index % 2 === 0 ? "request" : "result",
                fill: "#9e96a8",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
              },
              rect: { fill: "#17131e", stroke: "#4a3f58", strokeWidth: 1, rx: 3, ry: 3 },
            },
            position: { distance: 0.5 },
          });
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
    return () => {
      disposed = true;
      observer?.disconnect();
      paper?.remove();
      if (hostElement?.parentElement) hostElement.parentElement.style.height = "";
      graphRef.current = null;
      cellsRef.current = [];
    };
  }, [nodes, kind]);

  useEffect(() => {
    cellsRef.current.forEach((cell, index) => {
      const isStatic = activeFrame === undefined;
      cell.attr({
        body:
          index === activeFrame
            ? { fill: "#6c42ef", stroke: "#c8ff3d", strokeWidth: 2.5 }
            : {
                fill: index % 2 ? "#272033" : "#211b2b",
                stroke: isStatic ? "#8f7da4" : "#655a72",
                strokeWidth: 1.5,
              },
        label: { fill: isStatic || index <= activeFrame ? "#ffffff" : "#aaa3b0" },
      });
    });
  }, [activeFrame, ready]);

  return (
    <div className="joint-stage">
      <div ref={host} className="joint-paper" aria-hidden="true" />
      <ol className="sr-diagram">
        {nodes.map((node) => (
          <li key={node.name}>
            <b>{node.name}</b>: {node.detail}
          </li>
        ))}
      </ol>
      {!ready && (
        <div className="joint-loading">
          <i />
          <span>Building architecture graph…</span>
        </div>
      )}
      <div className="joint-legend">
        <span>
          <i className="request" />
          REQUEST PATH
        </span>
        <span>
          <i className="active" />
          ACTIVE COMPONENT
        </span>
        <span>ARROWS SHOW DATA DIRECTION</span>
      </div>
    </div>
  );
}
