import axios from 'axios';
import type { Chain } from 'lib/types';
import { BigNumber as DecimalBigNumber } from 'bignumber.js';
import { BigNumber, ethers } from 'ethers';

const PRICE_API_URL = 'https://min-api.cryptocompare.com/data/pricehistorical';
const PRICE_API_KEY = process.env.PRICE_API_KEY!;

export const getHistoricalPriceCoefficient = async (
  chain: Chain,
  timestampInSeconds: number,
): Promise<number | undefined> => {
  const tokenTicker = chain.currency
  try {
    const response = await axios.get(PRICE_API_URL, {
      params: {
        fsym: tokenTicker,
        tsyms: 'USD',
        ts: timestampInSeconds,
        api_key: PRICE_API_KEY,
      },
    });
    return response.data?.[tokenTicker]?.USD;
  } catch (e) {
    console.error(e);
  }
};

export const convertETHToUSD = (amountInWei: BigNumber, priceCoefficient?: number): number => {
  if (!priceCoefficient) return 0;
  const amountInEth = DecimalBigNumber(ethers.utils.formatEther(amountInWei));
  return amountInEth.multipliedBy(priceCoefficient).toNumber();
};
