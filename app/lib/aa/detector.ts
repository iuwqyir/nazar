import type { Chain, EtherscanTransactionData, DetectionResult } from 'lib/types';
import entryPointV6ABI from 'lib/ABIs/entrypoint-v6-abi.json';
import { decodeTransaction } from 'lib/transactions';

const ENTRYPOINT_V6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789'
const USER_OP_HANDLE_FUNCTION = 'handleOps'

export enum AccountAbstractionType {
  ERC4337 = 'erc4337',
  Safe = 'safe',
}

const detectERC4337Transaction = (
  transaction: EtherscanTransactionData,
): DetectionResult | undefined => {
  if (transaction.to !== ENTRYPOINT_V6_ADDRESS) return;
  const decodedTransaction = decodeTransaction(transaction, entryPointV6ABI);
  if (decodedTransaction?.name !== USER_OP_HANDLE_FUNCTION) return;
  return {
    type: AccountAbstractionType.ERC4337,
    version: '0.6.0',
    decodedTransaction,
    ABI: entryPointV6ABI,
  };
};

export const detectAccountAbstractionTransaction = async (
  chain: Chain,
  transaction: EtherscanTransactionData,
): Promise<DetectionResult | undefined> => {
  return detectERC4337Transaction(transaction);
};
