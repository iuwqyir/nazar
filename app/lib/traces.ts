import { Chain, DecodedSignatures, ProviderTrace, Trace } from "lib/types";
import { providers } from "ethers";
import { fetchDecodedSignatures } from "lib/signatures";

export const fetchTransactionTraceFromProvider = async (
  chain: Chain,
  transactionHash: string,
): Promise<ProviderTrace> => {
  const provider = new providers.JsonRpcProvider(chain.providerEndpoint);
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
  hash: string
): Promise<{ trace: Trace; innerOperationFailed: boolean }> => {
  const providerTrace = await fetchTransactionTraceFromProvider(chain, hash);
  const signatures = await fetchDecodedSignatures(collectEncodedTraceSignatures(providerTrace, []));
  const { trace, innerOperationFailed } = enrichTransactionTrace(
    providerTrace,
    signatures,
  );
  return { trace, innerOperationFailed };
};
