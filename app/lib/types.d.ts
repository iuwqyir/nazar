export type EtherscanTransactionData = {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  accessList?: string[];
  chainId: string;
  v: string;
  r: string;
  s: string;
};


export type Chain = {
  name: string
  explorerUrl: string
  explorerApiUrl: string
  explorerApiKey: string
}
