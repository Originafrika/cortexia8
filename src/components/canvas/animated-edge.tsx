import { useEffect, useState } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useCanvasStore } from "@/lib/canvas-store";

export function AnimatedEdge(props: EdgeProps) {
  const newEdgeIds = useCanvasStore((s) => s.newEdgeIds);
  const [drawProgress, setDrawProgress] = useState(newEdgeIds.has(props.id) ? 0 : 1);

  useEffect(() => {
    if (!newEdgeIds.has(props.id)) {
      setDrawProgress(1);
      return;
    }
    setDrawProgress(0);
    const start = performance.now();
    const duration = 600;
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDrawProgress(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [props.id, newEdgeIds]);

  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.3,
  });

  const dashLen = 2000;
  const offset = dashLen * (1 - drawProgress);

  return (
    <g className="animated-edge" style={{ opacity: drawProgress > 0 ? 1 : 0 }}>
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: "oklch(0.78 0.16 70 / 0.55)",
          strokeWidth: 1.5,
          strokeDasharray: dashLen,
          strokeDashoffset: offset,
          transition: drawProgress < 1 ? "none" : "stroke-dashoffset 0.1s ease-out",
        }}
        markerEnd={props.markerEnd}
        label={props.label}
        labelStyle={props.labelStyle}
        labelShowBg={props.labelShowBg}
        labelBgStyle={props.labelBgStyle}
        labelBgPadding={props.labelBgPadding}
        labelBgBorderRadius={props.labelBgBorderRadius}
      />
    </g>
  );
}
