import axios from 'axios';
import { DecodedSignatures } from './types';

export const fetchDecodedSignatures = async (
  hexSignatures: string[],
): Promise<DecodedSignatures | undefined> => {
  if (!hexSignatures.length) return;
  const signaturesResponse = await axios.get(
    'https://api.openchain.xyz/signature-database/v1/lookup',
    {
      params: {
        function: hexSignatures.join(','),
        filter: false,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return signaturesResponse.data?.result?.function;
};
