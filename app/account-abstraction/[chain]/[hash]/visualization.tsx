'use client';

import { Card, Title } from '@tremor/react';
import { AccountAbstractionData } from 'lib/types';
import React, { FC, useCallback } from "react";
import MempoolEdge from './mempoolEdge'

import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { buildERC4337Nodes, buildSafeNodes } from './nodeBuilder';
import { buildERC4337Edges, buildSafeEdges } from './edgeBuilder';

const edgeTypes = {
  'mempool-edge': MempoolEdge,
};

const Visualization: FC<{ data?: AccountAbstractionData }> = ({ data }) => {
  const initialNodes = data?.erc4337 ? buildERC4337Nodes(data?.chain!, data?.transaction.hash!, data?.erc4337) : buildSafeNodes(data?.chain!, data?.safe)
  const initialEdges = data?.erc4337 ? buildERC4337Edges(data?.erc4337) : buildSafeEdges(data?.safe)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => {
      const edge = { ...params, type: 'mempool-edge' };
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges]
  );

  const onNodeClick = (event, node) => {
    if (node?.data?.link) window.open(node.data.link, '_blank')
  }

  return (
    <Card className="mt-8">
      <Title>Components</Title>
      <div style={{ width: '80vw', height: '50vh' }}>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="top-right"
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
        >
          {/* <MiniMap
            nodeStrokeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              if (n.type === "input") return "#0041d0";
              if (n.type === "output") return "#ff0072";
              if (n.type === "default") return "#1a192b";

              return "#eee";
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background as string;

              return "#fff";
            }}
            nodeBorderRadius={2}
          /> */}
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </Card>
  );
}

export default Visualization
