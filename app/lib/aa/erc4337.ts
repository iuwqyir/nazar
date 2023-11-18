import { DetectionResult, ERC4337Data, EtherscanTransactionData, Paymaster, Trace, UserOp } from "lib/types";
import { AccountAbstractionType } from "./detector";
import { BigNumber, ethers } from "ethers";
import { convertETHToUSD } from "lib/prices";

const OP_HANDLE_FUNCTION_NAME = 'innerHandleOp';
const POST_OP_SIGNATURE = 'postOp(uint8,bytes,uint256)';

export enum PaymasterHandleType {
  Sponsor = 'sponsor',
  ERC20ByUser = 'erc20_by_user',
  Unknown = 'unknown',
}

const KNOWN_PAYMASTERS: { [key: string]: PaymasterHandleType } = {
  '0xe93eca6595fe94091dc1af46aac2a8b5d7990770': PaymasterHandleType.ERC20ByUser,
  '0x000031dd6d9d3a133e663660b959162870d755d4': PaymasterHandleType.Sponsor,
  '0x00000f79b7faf42eebadba19acc07cd08af44789': PaymasterHandleType.Sponsor,
  '0x00000f7365ca6c59a2c93719ad53d567ed49c14c': PaymasterHandleType.ERC20ByUser,
};

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
    const userOpTrace = findUserOpTrace(trace, index);
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
      paymaster: extractPaymasterData({
        paymasterAndData: userOp.paymasterAndData,
        opTrace: userOpTrace,
        priceCoefficient,
      }),
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

interface ExtractPaymasterDataInput {
  paymasterAndData: string;
  opTrace?: Trace;
  priceCoefficient?: number;
}

const extractPaymasterData = (input: ExtractPaymasterDataInput): Paymaster | undefined => {
  const paymaster = extractAddressFromBeginning(input.paymasterAndData);
  if (!paymaster) return;
  let actualGasCost;
  const postOpTrace = input.opTrace?.calls?.find(
    (trace) => trace.functionName === POST_OP_SIGNATURE && trace.to === paymaster,
  );
  if (postOpTrace && postOpTrace.input) {
    const decodedInput = ethers.utils.defaultAbiCoder.decode(
      ['uint8', 'bytes', 'uint256'],
      ethers.utils.hexDataSlice(postOpTrace.input, 4),
    );
    actualGasCost = decodedInput[2];
  }
  const type = KNOWN_PAYMASTERS[paymaster] || PaymasterHandleType.Unknown;
  const actualGasCostInUSD = convertETHToUSD(
    BigNumber.from(actualGasCost || 0),
    input.priceCoefficient,
  );
  return { address: paymaster, actualGasCost, type, actualGasCostInUSD };
};

const findUserOpTrace = (txTrace: Trace, index: number): Trace | undefined => {
  let detectedOpIndex = 0;
  for (const trace of txTrace.calls || []) {
    // innerHandleOps are always on the first level after handleOps
    if (trace.functionName?.startsWith(OP_HANDLE_FUNCTION_NAME)) {
      if (detectedOpIndex === index) return trace;
      detectedOpIndex++;
    }
  }
};
