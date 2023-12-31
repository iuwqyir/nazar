'use client';

import { Chain, ERC4337Data, SafeData } from 'lib/types';
import { shortenHex } from 'lib/util';
import { Position, Node } from "reactflow";
import { ERC4337_COLOR, SAFE_COLOR } from './visualization';

export const buildSafeNodes = (chain: Chain, data?: SafeData): Node[] => {
  if (!data) return []
  const decoded: any = data.transaction.dataDecoded
  const contract = decoded.parameters.find(param => param.type === 'address' && param.name === 'to')?.value
  const nodes: Node[] = [
    {
      id: "caller",
      type: "input",
      data: {
        link: `${chain.explorerUrl}/address/${data.transaction.executor}`,
        label: (
          <>
            Caller
            <p>{shortenHex(data.transaction.executor!)}</p>
          </>
        )
      },
      style: {
        backgroundColor: SAFE_COLOR
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
            <p>{shortenHex(data.transaction.safe)}</p>
          </>
        )
      },
      style: {
        backgroundColor: SAFE_COLOR
      },
      position: { x: 250, y: 100 }
    },
    {
      id: "singleton",
      type: contract ? 'default' : 'output',
      data: {
        link: `${chain.explorerUrl}/address/${data.singleton}`,
        label: (
          <>
            <p>{`Singleton ${data.version || ''}`}</p>
            <p>{shortenHex(data.singleton)}</p>
          </>
        )
      },
      style: {
        backgroundColor: SAFE_COLOR
      },
      position: { x: 250, y: 200 }
    },
  ]
  if (data.modules?.length) {
    nodes.push({
      id: 'plugin',
      type: 'input',
      data: {
        link: `${chain.explorerUrl}/address/${data.modules[0]}`,
        label: (
          <>
            <p>Module</p>
            <p>{shortenHex(data.modules[0])}</p>
          </>
        )
      },
      style: {
        backgroundColor: SAFE_COLOR
      },
      sourcePosition: Position.Left,
      position: { x: 450, y: 0 }
    })
  }

  if (decoded?.parameters?.length) {
    if (contract) {
      nodes.push({
        id: 'contract',
        type: 'output',
        data: {
          link: `${chain.explorerUrl}/address/${contract}`,
          label: (
            <>
              <p>Contract</p>
              <p>{shortenHex(contract)}</p>
            </>
          )
        },
        style: {
          backgroundColor: SAFE_COLOR
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
            <p>User Operation</p>
          </>
        )
      },
      style: {
        backgroundColor: ERC4337_COLOR
      },
      position: { x: 250, y: 0 }
    },
    {
      id: "bundler",
      data: {
        link: `${chain.explorerUrl}/address/${data.bundler}`,
        label: (
          <>
            <p>Bundler</p>
            <p>{shortenHex(data.bundler)}</p>
          </>
        )
      },
      style: {
        backgroundColor: ERC4337_COLOR
      },
      position: { x: 250, y: 150 }
    },
    {
      id: "entrypoint",
      data: {
        link: `${chain.explorerUrl}/address/${data.entryPoint}`,
        label: (
          <>
            <p>{`EntryPoint ${data.version || ''}`}</p>
            <p>{shortenHex(data.entryPoint)}</p>
          </>
        )
      },
      style: {
        backgroundColor: ERC4337_COLOR
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
            <p>Smart Account</p>
            <p>{shortenHex(userOp.sender)}</p>
          </>
        )
      },
      style: {
        backgroundColor: ERC4337_COLOR,
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
          <>
            <p>Account Factory</p>
            <p>{shortenHex(userOp.accountFactory)}</p>
          </>
        )
      },
      style: {
        backgroundColor: ERC4337_COLOR,
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
        link: `${chain.explorerUrl}/address/${userOp.paymaster.address}`,
        label: (
          <>
            <p>Paymaster</p>
            <p>{shortenHex(userOp.paymaster.address)}</p>
          </>
        )
      },
      position: { x: 450, y: 300 },
      targetPosition: Position.Left,
      style: {
        backgroundColor: ERC4337_COLOR,
        border: `1px dashed #000`
      }
    })
  }
  return nodes
}
