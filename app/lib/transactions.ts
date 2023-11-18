import axios from 'axios';
import type { Chain, EtherscanTransactionData } from 'lib/types';

export const findTransactionByHash = async (
  chain: Chain,
  hash: string,
): Promise<EtherscanTransactionData | undefined> => {
  const response = await axios.get(chain.explorerApiUrl, {
    params: {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      apiKey: chain.explorerApiKey,
      txhash: hash,
    },
  });
  const transaction = response?.data?.result;
  if (!transaction) return;
  return {
    ...transaction,
    to: transaction?.to?.toLowerCase(),
    from: transaction?.from?.toLowerCase(),
  };
};

