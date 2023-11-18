import { chains } from "lib/chains"
import { findTransactionByHash } from 'lib/transactions'
import { detectAccountAbstractionTransaction } from "lib/aa/detector"
import { fetchAccountAbstractionTrace as fetchTrace } from "lib/traces"
import { fetchBlockTimestamp } from "lib/blocks"

export const dynamic = 'force-dynamic' // defaults to force-static

type GetProps = {
  params: {
    chain: string
    hash: string
  }
}

export async function GET(request: Request, { params }: GetProps) {
  const chain = chains[params.chain]
  if (!chain) return Response.json({ error: 'Unsupported chain' })
  const transaction = await findTransactionByHash(chain, params.hash);
  if (!transaction) return Response.json({ error: 'could not find transaction' });

  const detectionResult = await detectAccountAbstractionTransaction(chain, transaction);
  if (!detectionResult)
    return Response.json({ error: 'not a account abstraction transaction' });

  const { trace, innerOperationFailed } = await fetchTrace(chain, params.hash, detectionResult.type);
  const timestamp = await fetchBlockTimestamp(chain, transaction.blockNumber);

  return Response.json({ timestamp, transaction, innerOperationFailed, trace, detectionResult })
}
