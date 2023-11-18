import type { Interface, TransactionDescription } from '@ethersproject/abi';
import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import type { Chain, EtherscanReceiptLog, EtherscanTransactionData, EtherscanTransactionReceipt } from 'lib/types';
import { convertETHToUSD } from 'lib/prices';

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

export const calculateTransactionFee = (gasPrice: string, gasUsed: string, priceCoefficient?: number): { inWei: BigNumber, inUSD: number } => {
  const inWei = BigNumber.from(gasUsed || 0).mul(BigNumber.from(gasPrice || 0));
  const inUSD = convertETHToUSD(inWei, priceCoefficient);
  return { inWei, inUSD }
}
