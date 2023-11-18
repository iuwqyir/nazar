import { TransactionDescription } from '@ethersproject/abi';

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

export type EtherscanTransactionReceipt = {
  blockHash: string
  blockNumber: string
  contractAddress?: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  from: string
  gasUsed: string
  logsBloom: string
  status: string
  to: string
  transactionHash: string
  transactionIndex: string
  type: string
  logs: EtherscanReceiptLog[]
};

export type EtherscanReceiptLog = {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  transactionIndex: string
  blockHash: string
  logIndex: string
  removed: boolean
}

export type Chain = {
  name: string
  explorerUrl: string
  explorerApiUrl: string
  explorerApiKey: string
  safeApiUrl: string
  providerEndpoint: string
}

export type DetectionResult = {
  type: AccountAbstractionType;
  version: string;
  decodedTransaction: TransactionDescription;
  ABI: any;
  safe?: {
    singleton: string;
    txHash: string
  }
};

export type Trace = ProviderTrace & {
  functionName?: string;
  isInnerHandleOp?: boolean;
  gasUsedParsed?: number;
  gasParsed?: number;
};

export type ProviderTrace = {
  from: string;
  gas: string;
  gasUsed: string;
  to: string;
  input?: string;
  output?: string;
  calls?: Trace[];
  value: string;
  type: string;
  error?: string;
  revertReason?: string;
};

export type DecodedSingature = {
  name: string;
  filtered: boolean;
};

export type DecodedSignatures = {
  [hexSignature: string]: DecodedSingature[];
};