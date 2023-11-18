import { Chain } from "./types";

export const chains: { [key: string]: Chain } = {
  ethereum: {
    name: 'ethereum',
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    explorerApiKey: process.env.ETHEREUM_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-mainnet.safe.global',
    providerEndpoint: process.env.ETHEREUM_PROVIDER_ENDPOINT!,
  },
  polygon: {
    name: 'polygon',
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    explorerApiKey: process.env.POLYGON_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-polygon.safe.global',
    providerEndpoint: process.env.POLYGON_PROVIDER_ENDPOINT!,
  },
  base: {
    name: 'base',
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://blockscout.com/xdai/mainnet/api',
    explorerApiKey: process.env.BASE_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-base.safe.global',
    providerEndpoint: process.env.BASE_PROVIDER_ENDPOINT!,
  },
  bnb: {
    name: 'bnb',
    explorerUrl: 'https://bscscan.com',
    explorerApiUrl: 'https://api.bscscan.com/api',
    explorerApiKey: process.env.BNB_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-bsc.safe.global',
    providerEndpoint: process.env.BNB_PROVIDER_ENDPOINT!,
  },
  optimism: {
    name: 'optimism',
    explorerUrl: 'https://optimistic.etherscan.io',
    explorerApiUrl: 'https://api-optimistic.etherscan.io/api',
    explorerApiKey: process.env.OPTIMISM_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-optimism.safe.global',
    providerEndpoint: process.env.OPTIMISM_PROVIDER_ENDPOINT!,
  },
  celo: {
    name: 'celo',
    explorerUrl: 'https://celoscan.io/',
    explorerApiUrl: 'https://api.celoscan.io/api',
    explorerApiKey: process.env.CELO_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-celo.safe.global',
    providerEndpoint: process.env.CELO_PROVIDER_ENDPOINT!,
  },
  arbitrum: {
    name: 'arbitrum',
    explorerUrl: 'https://arbiscan.io',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    explorerApiKey: process.env.ARBITRUM_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-arbitrum.safe.global',
    providerEndpoint: process.env.ARBITRUM_PROVIDER_ENDPOINT!,
  },
  gnosis: {
    name: 'gnosis',
    explorerUrl: 'https://gnosisscan.io',
    explorerApiUrl: 'https://api.gnosisscan.io/api',
    explorerApiKey: process.env.GNOSIS_EXPLORER_API_KEY!,
    safeApiUrl: 'https://safe-transaction-gnosis-chain.safe.global',
    providerEndpoint: process.env.GNOSIS_PROVIDER_ENDPOINT!,
  },
};

export const chainCurrencies: { [chain: string]: string } = {
  [chains.ethereum.name]: 'ETH',
  [chains.polygon.name]: 'MATIC',
  [chains.bnb.name]: 'BNB',
  [chains.base.name]: 'ETH',
  [chains.optimism.name]: 'ETH',
  [chains.celo.name]: 'CELO',
  [chains.arbitrum.name]: 'ETH',
  [chains.gnosis.name]: 'XDAI',
};
