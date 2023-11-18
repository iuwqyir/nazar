import { chains } from "../../../../lib/chains"
export const dynamic = 'force-dynamic' // defaults to force-static

type GetProps = {
  params: {
    chain: string
    hash: string
  }
}

export async function GET(request: Request, { params }: GetProps) {
  const chain = chains[params.chain]

  return Response.json({ chain: params.chain, hash: params.hash })
}
