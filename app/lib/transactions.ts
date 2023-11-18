import type { Interface, TransactionDescription } from '@ethersproject/abi';
import axios from 'axios';
import { ethers } from 'ethers';
import type { Chain, EtherscanReceiptLog, EtherscanTransactionData, EtherscanTransactionReceipt } from 'lib/types';

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

export const decodeTransaction = (
  transaction: EtherscanTransactionData,
  abi: any,
): TransactionDescription => {
  const _interface: Interface = new ethers.utils.Interface(abi);
  return _interface.parseTransaction({
    data: transaction.input,
    value: transaction.value,
  });
};

export const getTransactionReceipt = async (chain: Chain, hash: string): Promise<EtherscanTransactionReceipt | undefined> => {
  const response = await axios.get(chain.explorerApiUrl, {
    params: {
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      apiKey: chain.explorerApiKey,
      txhash: hash,
    },
  });
  const receipt = response?.data?.result;
  if (!receipt) return;
  return {
    ...receipt,
    from: receipt.from?.toLowerCase(),
    to: receipt.to?.toLowerCase(),
    logs: receipt.logs?.map((log: EtherscanReceiptLog) => ({
      ...log,
      address: log.address?.toLowerCase()
    }))
  };
}
