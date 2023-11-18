import { Trace } from "lib/types";
import { SAFE_TRANSACTION_FUNCTION } from "./detector";

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
