import { AccountAbstractionType } from "lib/aa/detector";
import { Chain, DecodedSignatures, ProviderTrace, Trace, TransactionError } from "lib/types";
import { providers, utils } from "ethers";
import { fetchDecodedSignatures } from "lib/signatures";
import { enrichSafeTrace } from "./aa/safe";
import { enrichERC4337Trace } from "./aa/erc4337";

export const fetchTransactionTraceFromProvider = async (
  chain: Chain,
  transactionHash: string,
): Promise<ProviderTrace> => {
  const provider = new providers.JsonRpcProvider({ skipFetchSetup: true, url: chain.providerEndpoint });
  return await provider.send('debug_traceTransaction', [transactionHash, { tracer: 'callTracer' }]);
};

export const collectEncodedTraceSignatures = (
  trace: ProviderTrace | Trace,
  signatures: string[],
): string[] => {
  if (trace.input && trace.input !== '0x') {
    const signature = trace.input.slice(0, 10);
    if (signatures.indexOf(signature) === -1) signatures.push(signature);
  }
  if (trace.calls?.length) {
    for (const call of trace.calls) {
      collectEncodedTraceSignatures(call, signatures);
    }
  }
  return signatures;
};

export const enrichTransactionTrace = (
  trace: ProviderTrace,
  signatures?: DecodedSignatures,
): { trace: Trace; innerOperationFailed: boolean } => {
  let innerOperationFailed = false;
  const handleTraceNode = (trace: Trace): Trace => {
    trace.gasParsed = parseInt(trace.gas, 16);
    trace.gasUsedParsed = parseInt(trace.gasUsed, 16);
    if (trace.input && trace.input !== '0x') {
      const functionName = signatures?.[trace.input.slice(0, 10)]?.[0]?.name;
      if (functionName) trace.functionName = functionName;
    }

    if (trace.from) trace.from = trace.from.toLowerCase();
    if (trace.to) trace.to = trace.to.toLowerCase();
    if (trace.revertReason || trace.error) innerOperationFailed = true;

    trace.gasParsed = parseInt(trace.gas, 16);
    trace.gasUsedParsed = parseInt(trace.gasUsed, 16);

    if (trace.calls?.length) {
      for (const call of trace.calls) {
        handleTraceNode(call);
      }
    }
    return trace;
  };
  return { trace: handleTraceNode(trace), innerOperationFailed };
};

export const fetchAccountAbstractionTrace = async (
  chain: Chain,
  hash: string,
  type: AccountAbstractionType,
): Promise<{ trace: Trace; innerOperationFailed: boolean }> => {
  const providerTrace = await fetchTransactionTraceFromProvider(chain, hash);
  const signatures = await fetchDecodedSignatures(collectEncodedTraceSignatures(providerTrace, []));
  const { trace: enrichedTrace, innerOperationFailed } = enrichTransactionTrace(
    providerTrace,
    signatures,
  );
  const trace =
    type === AccountAbstractionType.Safe
      ? enrichSafeTrace(enrichedTrace)
      : enrichERC4337Trace(enrichedTrace);
  return { trace, innerOperationFailed };
};

export const extractErrorDataFromTrace = (trace: Trace, abi: any): TransactionError | undefined => {
  if (!trace.error || !trace.output) return;
  try {
    const _interface = new utils.Interface(abi);
    const decoded = _interface.parseError(trace.output);
    return { message: trace.error, decoded: decoded.args[1] };
  } catch (e) {
    const encodedErrorString = `0x${trace.output.substring(10)}`;
    const decoded = utils.defaultAbiCoder.decode(['string'], encodedErrorString);
    return { message: trace.error, decoded: decoded[0] };
  }
};