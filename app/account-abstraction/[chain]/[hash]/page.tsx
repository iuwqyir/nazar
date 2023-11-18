"use client"
import { useEffect, useState } from 'react';

type PageProps = {
  params: {
    chain: string
    hash: string
  }
}

export default function Page({ params: { chain, hash } }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  async function fetchData(chain: string, hash: string) {
    setIsLoading(true);

    const response = await fetch(`/api/aa/${chain}/${hash}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const responseJson = await response.json();
    setTransaction(responseJson);

    setIsLoading(false);
  }

  useEffect(() => {
    if (!chain || !hash) return;
    fetchData(chain as string, hash as string);
  }, [chain, hash]);

  return (
    <pre>
      {JSON.stringify(transaction, null, 2)}
    </pre>
  );
};
