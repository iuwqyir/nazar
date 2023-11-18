'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';
import { AccountAbstractionData, Chain, ERC4337Data } from 'lib/types';
import React, { FC, useCallback } from "react";
import MempoolEdge from './mempoolEdge'

import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";

const buildERC4337Nodes = (chain: Chain, hash: string, data?: ERC4337Data): Node[] => {
  if (!data) return []
  const userOp = data.userOps[0]
  const nodes: Node[] = [
    {
      id: "userop",
      type: "input",
      data: {
        link: `${chain.explorerUrl}/tx/${hash}`,
        label: (
          <>
            User Operation
          </>
        )
      },
      position: { x: 250, y: 0 }
    },
    {
      id: "bundler",
      data: {
        link: `${chain.explorerUrl}/address/${data.bundler}`,
        label: (
          <>
            Bundler
          </>
        )
      },
      position: { x: 250, y: 150 }
    },
    {
      id: "entrypoint",
      data: {
        link: `${chain.explorerUrl}/address/${data.entryPoint}`,
        label: (
          <>
            {`EntryPoint ${data.version || ''}`}
          </>
        )
      },
      position: { x: 250, y: 250 }
    },
    {
      id: "account",
      type: "output",
      data: {
        link: `${chain.explorerUrl}/address/${userOp.sender}`,
        label: (
          <>
            Smart Account
          </>
        )
      },
      position: { x: 250, y: 350 }
    },
  ]
  if (userOp?.accountFactory) {
    nodes.push({
      id: 'accountfactory',
      data: {
        link: `${chain.explorerUrl}/address/${userOp.accountFactory}`,
        label: (
          <>Account Factory</>
        )
      },
      style: {
        color: "#333",
        border: "1px dashed #000"
      },
      position: { x: 50, y: 300 },
      sourcePosition: Position.Right,
      targetPosition: Position.Right
    })
  }
  if (userOp?.paymaster) {
    nodes.push({
      id: 'paymaster',
      type: 'output',
      data: {
        link: `${chain.explorerUrl}/address/${userOp.paymaster}`,
        label: (
          <>Paymaster</>
        )
      },
      position: { x: 450, y: 300 },
      targetPosition: Position.Left,
      style: {
        color: "#333",
        border: "1px dashed #000"
      }
    })
  }
  return nodes
}

const buildERC4337Edges = (data?: ERC4337Data): Edge[] => {
  if (!data) return []
  const edges: Edge[] = [
    {
      id: "e-userop-bundler",
      source: "userop",
      target: "bundler",
      type: 'mempool-edge'
    },
    {
      id: "e-bundler-entrypoint",
      source: "bundler",
      target: "entrypoint",
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    },
    {
      id: "e-entrypoint-account",
      source: "entrypoint",
      target: "account",
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    }
  ]
  if (data.userOps?.[0].accountFactory) {
    edges.push({
      id: 'e-entrypoint-accountfactory',
      source: 'entrypoint',
      target: 'accountfactory',
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    })
    edges.push({
      id: 'e-accountfactory-account',
      source: 'accountfactory',
      target: 'account',
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    })
  }
  if (data.userOps?.[0].paymaster) {
    edges.push({
      id: 'e-entrypoint-paymaster',
      source: 'entrypoint',
      target: 'paymaster',
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    })
  }
  return edges
}

const edgeTypes = {
  'mempool-edge': MempoolEdge,
};

const Visualization: FC<{ data?: AccountAbstractionData }> = ({ data }) => {
  const initialNodes = buildERC4337Nodes(data?.chain!, data?.transaction.hash!, data?.erc4337)
  const initialEdges = buildERC4337Edges(data?.erc4337)
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
          <MiniMap
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
          />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </Card>
  );
}

export default Visualization
