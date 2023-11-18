'use client';

import { Chain, ERC4337Data, SafeData } from 'lib/types';
import { Position, Node } from "reactflow";

export const buildSafeNodes = (chain: Chain, data?: SafeData): Node[] => {
  console.log(data)
  if (!data) return []
  const nodes: Node[] = [
    {
      id: "caller",
      type: "input",
      data: {
        link: `${chain.explorerUrl}/address/${data.transaction.executor}`,
        label: (
          <>
            Caller
          </>
        )
      },
      position: { x: 250, y: 0 }
    },
    {
      id: "safeproxy",
      data: {
        link: `${chain.explorerUrl}/address/${data.transaction.safe}`,
        label: (
          <>
            Safe Proxy
          </>
        )
      },
      position: { x: 250, y: 100 }
    },
    {
      id: "singleton",
      type: data.transaction.dataDecoded ? 'default' : 'output',
      data: {
        link: `${chain.explorerUrl}/address/${data.singleton}`,
        label: (
          <>
            {`Singleton ${data.version || ''}`}
          </>
        )
      },
      position: { x: 250, y: 200 }
    },
  ]
  if (data.plugin) {
    nodes.push({
      id: 'plugin',
      type: 'input',
      data: {
        link: `${chain.explorerUrl}/address/${data.plugin}`,
        label: (
          <>
            Module
          </>
        )
      },
      sourcePosition: Position.Left,
      position: { x: 450, y: 0 }
    })
  }
  const decoded: any = data.transaction.dataDecoded
  if (decoded?.parameters?.length) {
    const to = decoded.parameters.filter(param => param.type === 'address' && param.name === 'to')
    if (to) {
      nodes.push({
        id: 'contract',
        type: 'output',
        data: {
          link: `${chain.explorerUrl}/address/${to}`,
          label: (
            <>
              Contract
            </>
          )
        },
        sourcePosition: Position.Left,
        position: { x: 250, y: 300 }
      })
    }
  }
  return nodes
}

export const buildERC4337Nodes = (chain: Chain, hash: string, data?: ERC4337Data): Node[] => {
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
