import axios from 'axios';
import type { Chain } from 'lib/types';

export const fetchBlockTimestamp = async (
  chain: Chain,
  blockNumberInHex: string,
): Promise<number> => {
  const blockResponse = await axios.get(chain.explorerApiUrl, {
    params: {
      module: 'proxy',
      action: 'eth_getBlockByNumber',
      apiKey: chain.explorerApiKey,
      boolean: true,
      tag: blockNumberInHex,
    },
  });
  return Number(blockResponse.data.result.timestamp) * 1000;
};
