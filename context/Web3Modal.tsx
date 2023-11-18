"use client"

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

// 3. Create modal
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
  themeMode: 'light'
})

export function Web3ModalProvider({ children }) {
  return children;
}