import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeMouseHandler,
  type EdgeTypes,
  type OnConnectStart,
  type OnConnectEnd,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { useCanvasStore } from "@/lib/canvas-store";
import { NodeCard } from "@/components/canvas/node-card";
import { AnimatedEdge } from "@/components/canvas/animated-edge";
import { type CanvasNode, portsForCategory, type PortType } from "@/lib/canvas-types";
import type { ModelCategory } from "@/lib/models";
import { useIsMobile } from "@/hooks/use-mobile";

const nodeTypes = { modelNode: NodeCard };
const edgeTypes: EdgeTypes = { default: AnimatedEdge };

const MINIMAP_COLOR: Record<ModelCategory, string> = {
  image: "#f59e0b",
  video: "#a78bfa",
  audio: "#10b981",
  text: "#60a5fa",
  music: "#f472b6",
};

export function CanvasFlow() {
  const isMobile = useIsMobile();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const isValidConnection = useCanvasStore((s) => s.isValidConnection);
  const setReadOnly = useCanvasStore((s) => s.setReadOnly);

  useEffect(() => {
    setReadOnly(isMobile);
  }, [isMobile, setReadOnly]);

  const handleNodeClick: NodeMouseHandler = (_e, node) => {
    useCanvasStore.getState().setSelectedNodeId(node.id);
  };

  const handlePaneClick = () => {
    useCanvasStore.getState().setSelectedNodeId(null);
  };

  const handleConnectStart: OnConnectStart = (_event, params) => {
    if (params.handleType === "source") {
      const sourceNode = useCanvasStore.getState().nodes.find((n) => n.id === params.nodeId);
      if (sourceNode) {
        const portType: PortType = portsForCategory(sourceNode.data.category).out;
        useCanvasStore.getState().setDraggingFromPort(portType);
      }
    }
  };

  const handleConnectEnd: OnConnectEnd = () => {
    useCanvasStore.getState().setDraggingFromPort(null);
  };

  return (
    <div className="absolute inset-0 dark">
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        isValidConnection={isValidConnection}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodesDraggable={!isMobile}
        nodesConnectable={!isMobile}
        elementsSelectable
        deleteKeyCode={isMobile ? null : ["Backspace", "Delete"]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "var(--ring)", strokeWidth: 1.5 },
        }}
        proOptions={{ hideAttribution: true }}
        fitView={nodes.length > 0}
        fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--border)" />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!bg-surface-1/80 !border-border !backdrop-blur !rounded-xl !overflow-hidden"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          maskColor="color-mix(in oklab, var(--background) 85%, transparent)"
          nodeColor={(n) => {
            const cat = (n.data as CanvasNode["data"])?.category as ModelCategory | undefined;
            return cat ? MINIMAP_COLOR[cat] : "#888";
          }}
          nodeStrokeColor={() => "transparent"}
          style={{
            background: "color-mix(in oklab, var(--surface-1) 85%, transparent)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        />
      </ReactFlow>
    </div>
  );
}
