import { DetectionResult, ERC4337Data, EtherscanTransactionData, Trace, UserOp } from "lib/types";
import { AccountAbstractionType } from "./detector";
import { BigNumber } from "ethers";
import { convertETHToUSD } from "lib/prices";

const OP_HANDLE_FUNCTION_NAME = 'innerHandleOp';

export const enrichERC4337Trace = (trace: Trace): Trace => {
  const handleTraceNode = (trace: Trace, isInnerHandleOp?: boolean): Trace => {
    trace.isInnerHandleOp =
      trace.functionName?.includes(OP_HANDLE_FUNCTION_NAME) || isInnerHandleOp;

    if (trace.calls?.length) {
      for (const call of trace.calls) {
        handleTraceNode(call, trace.isInnerHandleOp);
      }
    }
    return trace;
  };
  return handleTraceNode(trace);
};

export const getERC4337Data = (
  transaction: EtherscanTransactionData,
  detectionResult: DetectionResult,
  trace: Trace,
  priceCoefficient: number | undefined
): ERC4337Data | undefined => {
  if (detectionResult.type !== AccountAbstractionType.ERC4337) return;

  const rawUserOps = detectionResult.decodedTransaction.args?.ops || [];
  const userOps: UserOp[] = [];
  for (let index = 0; index < rawUserOps.length; index++) {
    const userOp = rawUserOps[index];
    userOps.push({
      sender: userOp.sender?.toLowerCase(),
      nonce: userOp.nonce?.toNumber(),
      accountFactory: extractAddressFromBeginning(userOp.initCode),
      callData: userOp.callData,
      callGasLimit: userOp.callGasLimit?.toNumber(),
      verificationGasLimit: userOp.verificationGasLimit?.toNumber(),
      preVerificationGas: userOp.preVerificationGas?.toNumber(),
      paymasterAndData: userOp.paymasterAndData,
      signature: userOp.signature,
    });
  }

  const bundler = detectionResult.decodedTransaction.args?.beneficiary?.toLowerCase();
  const entryPoint = transaction.to;
  const bundlerCompensation = extractBundlerCompensation(transaction, trace, entryPoint, bundler);
  const bundlerCompensationInUSD = convertETHToUSD(bundlerCompensation, priceCoefficient);

  return {
    version: detectionResult.version,
    userOps,
    entryPoint,
    bundler,
    bundlerCompensation: bundlerCompensation.toHexString(),
    bundlerCompensationInUSD
  };
}

const extractAddressFromBeginning = (data: string): string | undefined =>
  data !== '0x' ? data.slice(0, 42)?.toLowerCase() : undefined;

const extractBundlerCompensation = (
  transaction: EtherscanTransactionData,
  txTrace: Trace,
  entryPoint: string,
  bundler: string,
): BigNumber => {
  const txFee = BigNumber.from(txTrace?.gasUsed).mul(transaction.gasPrice);
  for (const trace of txTrace.calls || []) {
    // bundler refund is always on the first level after handleOps
    if (trace.from === entryPoint && trace.to === bundler && trace.value) {
      return BigNumber.from(trace.value).sub(txFee);
    }
  }
  return BigNumber.from(0).sub(txFee);
};
