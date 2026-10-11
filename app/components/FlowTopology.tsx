"use client";

import {
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";

type Layer = {
  name: string;
  detail: string;
};

type LayerData = {
  index: number;
  label: string;
  detail: string;
  active: boolean;
};

type LayerNode = Node<LayerData, "layer">;

const DiagramNode = memo(function DiagramNode({ data }: NodeProps<LayerNode>) {
  return (
    <motion.article
      className={data.active ? "flow-topology-node active" : "flow-topology-node"}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: data.index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span>{String(data.index + 1).padStart(2, "0")}</span>
      <b>{data.label}</b>
      <small>{data.detail}</small>
    </motion.article>
  );
});

const nodeTypes = { layer: DiagramNode };

export function FlowTopology({ layers, activeIndex }: { layers: Layer[]; activeIndex?: number }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const nodes = useMemo<LayerNode[]>(
    () =>
      layers.map((layer, index) => ({
        id: `layer-${index}`,
        type: "layer",
        position: compact
          ? { x: index % 2 === 0 ? 10 : 190, y: Math.floor(index / 2) * 155 }
          : { x: (index % 3) * 310, y: Math.floor(index / 3) * 185 },
        sourcePosition: compact ? Position.Bottom : Position.Right,
        targetPosition: compact ? Position.Top : Position.Left,
        draggable: false,
        selectable: false,
        data: {
          index,
          label: layer.name,
          detail: layer.detail,
          active: activeIndex === index,
        },
      })),
    [activeIndex, compact, layers],
  );

  const edges = useMemo<Edge[]>(
    () =>
      layers.slice(0, -1).map((_, index) => ({
        id: `edge-${index}`,
        source: `layer-${index}`,
        target: `layer-${index + 1}`,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#c8ff3d", width: 18, height: 18 },
        className: activeIndex !== undefined && index < activeIndex ? "completed" : "",
        style: { strokeWidth: 2.5 },
      })),
    [activeIndex, layers],
  );

  return (
    <div className="flow-topology" aria-label="Interactive GenAI request architecture">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: compact ? 0.12 : 0.18 }}
        minZoom={0.55}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      />
      <div className="flow-topology-hint">DRAG TO PAN · PINCH TO ZOOM · ARROWS SHOW DIRECTION</div>
    </div>
  );
}
