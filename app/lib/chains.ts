import { Chain } from "./types";

export const chains: { [key: string]: Chain } = {
  ethereum: {
    name: 'ethereum',
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    explorerApiKey: process.env.ETHEREUM_EXPLORER_API_KEY!,
  },
  polygon: {
    name: 'polygon',
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    explorerApiKey: process.env.POLYGON_EXPLORER_API_KEY!,
  },
  base: {
    name: 'base',
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://blockscout.com/xdai/mainnet/api',
    explorerApiKey: process.env.BASE_EXPLORER_API_KEY!,
  },
  bnb: {
    name: 'bnb',
    explorerUrl: 'https://bscscan.com',
    explorerApiUrl: 'https://api.bscscan.com/api',
    explorerApiKey: process.env.BNB_EXPLORER_API_KEY!,
  },
  optimism: {
    name: 'optimism',
    explorerUrl: 'https://optimistic.etherscan.io',
    explorerApiUrl: 'https://api-optimistic.etherscan.io/api',
    explorerApiKey: process.env.OPTIMISM_EXPLORER_API_KEY!,
  },
  celo: {
    name: 'celo',
    explorerUrl: 'https://explorer.celo.org/mainnet',
    explorerApiUrl: 'https://explorer.celo.org/mainnet/api',
    explorerApiKey: process.env.CELO_EXPLORER_API_KEY!,
  },
  arbitrum: {
    name: 'arbitrum',
    explorerUrl: 'https://arbiscan.io',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    explorerApiKey: process.env.ARBITRUM_EXPLORER_API_KEY!,
  },
  gnosis: {
    name: 'gnosis',
    explorerUrl: 'https://gnosisscan.io',
    explorerApiUrl: 'https://api.gnosisscan.io/api',
    explorerApiKey: process.env.GNOSIS_EXPLORER_API_KEY!,
  },
};
