import { Contract } from 'ethers'
import { getSafeSingletonDeployment } from '@safe-global/safe-deployments';
import type { Chain, EtherscanTransactionData, DetectionResult, EtherscanReceiptLog } from 'lib/types';
import entryPointV6ABI from 'lib/ABIs/entrypoint-v6-abi.json';
import { decodeTransaction, getTransactionReceipt } from 'lib/transactions';

export const ENTRYPOINT_V6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789'
export const USER_OP_HANDLE_FUNCTION = 'handleOps'
const SUPPORTED_SAFE_VERSIONS = ['1.3.0', '1.4.1', '1.2.0', '1.1.1', '1.0.0'];
const SAFE_TRANSACTION_FUNCTION = 'execTransaction';

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

const findSafeTransactionHash = (logs: EtherscanReceiptLog[], contract: Contract, safeAddress: string): string | undefined => {
  for (const log of logs) {
    if (log.address.toLowerCase() !== safeAddress) continue;
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (!['ExecutionSuccess', 'ExecutionFailure'].includes(parsedLog.name)) continue;
      if (!parsedLog?.args.txHash) continue;
      return parsedLog.args.txHash;
    } catch (err) {
      console.log(err);
      continue;
    }
  }
}

const detectSafeTransaction = async (
  chain: Chain,
  transaction: EtherscanTransactionData,
): Promise<DetectionResult | undefined> => {
  const receipt = await getTransactionReceipt(chain, transaction.hash)
  if (!receipt) return

  for (const version of SUPPORTED_SAFE_VERSIONS) {
    const deployment = getSafeSingletonDeployment({ version });
    if (!deployment?.abi) continue;

    const contract = new Contract(transaction.to, deployment.abi);
    const safeTxHash = findSafeTransactionHash(receipt.logs, contract, transaction.to);
    if (!safeTxHash) continue

    try {
      const decodedTransaction = decodeTransaction(transaction, deployment?.abi);
      if (decodedTransaction.functionFragment.name !== SAFE_TRANSACTION_FUNCTION) continue;
      return {
        type: AccountAbstractionType.Safe,
        version,
        decodedTransaction,
        ABI: deployment.abi,
        safe: {
          singleton: deployment.defaultAddress,
          txHash: safeTxHash
        }
      };
    } catch (err) {
      continue;
    }
  }
};

export const detectAccountAbstractionTransaction = async (
  chain: Chain,
  transaction: EtherscanTransactionData,
): Promise<DetectionResult | undefined> => {
  const erc4337Result = detectERC4337Transaction(transaction);
  if (erc4337Result) return erc4337Result;

  return await detectSafeTransaction(chain, transaction);
};
