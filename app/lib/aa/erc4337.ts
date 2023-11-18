import { Trace } from "lib/types";

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
