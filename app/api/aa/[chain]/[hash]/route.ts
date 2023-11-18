import { chains } from "../../../../lib/chains"
import { findTransactionByHash } from 'lib/transactions'
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

  return Response.json({ transaction })
}
