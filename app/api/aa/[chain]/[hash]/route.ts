import { chains } from "lib/chains"
import { calculateTransactionFee, findTransactionByHash } from 'lib/transactions'
import { detectAccountAbstractionTransaction } from "lib/aa/detector"
import { extractErrorDataFromTrace, fetchAccountAbstractionTrace as fetchTrace } from "lib/traces"
import { fetchBlockTimestamp } from "lib/blocks"
import { getHistoricalPriceCoefficient } from "lib/prices"
import { getERC4337Data } from "lib/aa/erc4337"

export const dynamic = 'force-dynamic' // defaults to force-static

type GetProps = {
  params: {
    chain: string
    hash: string
  }
}

export async function GET(request: Request, { params }: GetProps): Promise<Response> {
  const chain = chains[params.chain]
  if (!chain) return Response.json({ error: 'Unsupported chain' })
  const transaction = await findTransactionByHash(chain, params.hash);
  if (!transaction) return Response.json({ error: 'could not find transaction' });

  const detectionResult = await detectAccountAbstractionTransaction(chain, transaction);
  if (!detectionResult)
    return Response.json({ error: 'not a account abstraction transaction' });

  const [{ trace, innerOperationFailed }, timestamp] = await Promise.all([
    fetchTrace(chain, params.hash, detectionResult.type),
    fetchBlockTimestamp(chain, transaction.blockNumber)
  ])
  const priceCoefficient = await getHistoricalPriceCoefficient(chain, timestamp / 1000);
  const fee = calculateTransactionFee(transaction.gasPrice, trace.gasUsed, priceCoefficient)
  const errorData = extractErrorDataFromTrace(trace, detectionResult.ABI)

  const erc4337 = getERC4337Data(transaction, detectionResult)
  return Response.json({ timestamp, transaction, errorData, fee, innerOperationFailed, trace, detectionResult, erc4337 })
}
