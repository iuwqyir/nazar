import { Chain, DetectionResult, EtherscanTransactionData, SafeData, Trace } from "lib/types";
import { AccountAbstractionType, SAFE_TRANSACTION_FUNCTION } from "./detector";
import SafeApiKit from '@safe-global/api-kit';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';

export const enrichSafeTrace = (trace: Trace): Trace => {
  const handleTraceNode = (trace: Trace, isInnerHandleOp?: boolean): Trace => {
    trace.isInnerHandleOp =
      trace.functionName?.includes(SAFE_TRANSACTION_FUNCTION) || isInnerHandleOp;

    if (trace.calls?.length) {
      for (const call of trace.calls) {
        handleTraceNode(call, trace.isInnerHandleOp);
      }
    }
    return trace;
  };
  return handleTraceNode(trace);
};

const initSafeApi = (chain: Chain): SafeApiKit => {
  const provider = new ethers.providers.JsonRpcProvider({ skipFetchSetup: true, url: chain.providerEndpoint });
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: provider,
  });
  return new SafeApiKit({
    txServiceUrl: chain.safeApiUrl,
    ethAdapter,
  });
}

export const getSafeData = async (
  chain: Chain,
  transaction: EtherscanTransactionData,
  trace: Trace,
  detectionResult: DetectionResult,
): Promise<SafeData | undefined> => {
  if (detectionResult.type !== AccountAbstractionType.Safe || !detectionResult.safe) return;

  const safeService = initSafeApi(chain)  
  const safeTransaction = await safeService.getTransaction(detectionResult.safe.txHash);
  const safeInfo = await safeService.getSafeInfo(safeTransaction.safe)

  const definedModules = safeInfo.modules?.map(module => module.toLowerCase())
  let modules: string[] = [];
  const guard = safeInfo.guard !== '0x0000000000000000000000000000000000000000' ? safeInfo.guard : ''
  let preGuard = false;
  let postGuard = false;
  const handleTraceNode = (trace: Trace): Trace => {
    if (trace.functionName?.startsWith('execTransactionFromModule') && definedModules?.includes(trace.from)) {
      modules.push(trace.from)
    }
    if (trace.functionName?.startsWith('preExecCheck')) {
      preGuard = true;
    }
    if (trace.functionName?.startsWith('postExecCheck')) {
      postGuard = true;
    }
    if (trace.calls?.length) {
      for (const call of trace.calls) {
        handleTraceNode(call);
      }
    }
    return trace;
  };
  handleTraceNode(trace);
  return {
    transaction: safeTransaction,
    safeInfo,
    singleton: detectionResult.safe.singleton,
    version: detectionResult.version,
    modules,
    guard,
    account: transaction.to,
    preGuard,
    postGuard,
  };
};
