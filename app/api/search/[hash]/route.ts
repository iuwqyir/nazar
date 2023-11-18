import { Chain } from 'lib/types';
import { detectAccountAbstractionTransaction } from 'lib/aa/detector';
import { findTransactionByHash } from 'lib/transactions';
import {chains} from 'lib/chains';

export type FindTransactionsResponse = {
  data?: TransactionOnChain[];
  error?: string;
};

export type TransactionOnChain = {
  hash: string;
  chain: Chain;
  exists: boolean;
  isUserOp: boolean;
};

type GetProps = {
    params: {
      hash: string
    }
}

const CHUNK_SIZE = 4; // etherscan api rate limit is 5 calls/second

const getTransactionInfo = async (
  hash: string,
  chain: Chain,
): Promise<{ exists: boolean; isUserOp: boolean }> => {
  const transaction = await findTransactionByHash(chain, hash);
  if (!transaction || transaction?.hash !== hash) return { exists: false, isUserOp: false };
  const detectionResult = await detectAccountAbstractionTransaction(chain, transaction);
  if (!detectionResult) return { exists: true, isUserOp: false };
  return { exists: true, isUserOp: true };
};

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const batchChainCalls = async (hash: string, chains: Chain[]): Promise<TransactionOnChain[]> => {
  const chunks: Chain[][] = [];
  for (let i = 0; i < chains.length; i += CHUNK_SIZE) {
    chunks.push(chains.slice(i, i + CHUNK_SIZE));
  }
  const result: TransactionOnChain[] = [];
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(async (chain: Chain) => {
        const txInfo = await getTransactionInfo(hash, chain);
        return { hash, chain, ...txInfo };
      }),
    );
    result.push(...chunkResults);
    await wait(1000);
  }
  return result;
};

export async function GET(request: Request, { params }: GetProps) {
    const txHash = params.hash;
    if (!txHash) return Response.json({ error: 'transaction hash is required' });
    const supportedChains = Object.values(chains) as Chain[]
    if (!supportedChains?.length) return Response.json({ error: '"chains" is required' });
  
    try {
      const result = await batchChainCalls(txHash, supportedChains);
      const filteredResult = result.filter((r) => r.isUserOp === true)
      return Response.json({ data: filteredResult });
    } catch (err: any) {
      console.log(err)
      return Response.json({ error: err.message });
    }
}

