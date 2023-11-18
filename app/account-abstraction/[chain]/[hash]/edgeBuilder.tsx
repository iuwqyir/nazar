'use client';

import { ERC4337Data, SafeData } from 'lib/types';
import { MarkerType, Edge } from "reactflow";

export const buildSafeEdges = (data?: SafeData): Edge[] => {
  if (!data) return []
  const edges: Edge[] = [
    {
      id: "e-caller-safeproxy",
      source: "caller",
      target: "safeproxy",
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
    },
    {
      id: "e-safeproxy-singleton",
      source: "safeproxy",
      target: "singleton",
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    }
  ]
  if (data.plugin) {
    edges.push({
      id: "e-plugin-safeproxy",
      source: "plugin",
      target: "safeproxy",
      markerEnd: {
        type: MarkerType.ArrowClosed
      },
      animated: true
    })
  }
  const decoded: any = data.transaction.dataDecoded
  if (decoded?.parameters?.length) {
    const to = decoded.parameters.filter(param => param.type === 'address' && param.name === 'to')
    if (to) {
      edges.push({
        id: "e-singleton-contract",
        source: "singleton",
        target: "contract",
        markerEnd: {
          type: MarkerType.ArrowClosed
        },
        label: decoded.method,
        animated: true
      })
    }
  }
  return edges
}

export const buildERC4337Edges = (data?: ERC4337Data): Edge[] => {
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
