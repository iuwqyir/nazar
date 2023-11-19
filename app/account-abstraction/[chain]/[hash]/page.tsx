"use client"
import { FC, useEffect, useState } from 'react';
import { MdContentCopy, MdCheckCircle } from 'react-icons/md';
import { Card, Subtitle, Text, Title, Flex, Grid, Metric } from '@tremor/react';
import Loader from 'app/components/loader';
import { AccountAbstractionData, Chain, ERC4337Data, SafeData, TransactionError } from 'lib/types';
import React from 'react'
import { ethers, BigNumber } from 'ethers';
import { formatDistanceToNowStrict } from 'date-fns';
import TransactionFlow from 'app/components/transactionFlow';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import Visualization from './visualization'
import { shortenHex } from 'lib/util';
import DetailsWidget from 'app/components/DetailsWidget';

type PageProps = {
  params: {
    chain: string
    hash: string
  }
}

type Response = {
  data?: AccountAbstractionData
  error?: string
}

const formatUSD = (dollarAmount: number): string => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return currencyFormatter.format(dollarAmount || 0);
};

export default function Page({ params: { chain, hash } }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AccountAbstractionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(chain: string, hash: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aa/${chain}/${hash}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const responseJson: Response = await response.json();
      if (responseJson.data) {
        setData(responseJson.data);
        setError(null)
      }
      if (responseJson.error) {
        setError(responseJson.error)
        setData(null)
      }
    } catch (err) {
      setError('Failed to complete request. Try again later.')
      setData(null)
    }

    setIsLoading(false);
  }

  function renameKeys(json: any): any {
    if (Array.isArray(json)) {
      return json.map((item) => renameKeys(item));
    } else if (json !== null && typeof json === 'object') {
      let newObject: { [key: string]: any } = {};
      for (const key in json) {
        let newKey = key;
        if (key === 'from') {
          newKey = 'name';
        } else if (key === 'calls') {
          newKey = 'children';
        }
        newObject[newKey] = renameKeys(json[key]);
      }
      return newObject;
    }
    return json;
  }

  useEffect(() => {
    if (!chain || !hash) return;
    fetchData(chain as string, hash as string);
  }, [chain, hash]);

  if (isLoading) return <Loader />
  if (error) return <span>{error}</span>
  if (!data) return null

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="pb-5">
        <DetailsWidget
          type={data.detectionResult.type.toUpperCase()}
          status= {(<StatusHeader error={data.errorData} isWarning={data.innerOperationFailed}/>)}
          fee={(<Metric className={`${BigNumber.from(data.erc4337?.bundlerCompensation || 0).isNegative() ? 'text-red-600' : ''}`}>{formatUSD(data.erc4337?.bundlerCompensationInUSD || data.feeInUSD)}</Metric>)}
          feesTitle={data.erc4337 ? `Bundler Fees` : `Transaction Fees`}
        />
      </div>
      <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
        {/* Existing Card */}
        <Card key="transaction">
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-2"
          >
            <Title>Transaction</Title>
            <Subtitle
              className="cursor-pointer"
              onClick={() =>
                window.open(
                  `${data.chain.explorerUrl}/tx/${data.transaction.hash}`,
                  '_blank'
                )
              }
            >
              {shortenHex(data.transaction.hash)}
            </Subtitle>
          </Flex>
          <Flex className="mt-6">
            <Text>Chain</Text>
            <Text className="text-right">{data.chain.name}</Text>
          </Flex>
          <Flex className="mt-3">
            <Text>Type</Text>
            <Text className="text-right">
              {data.detectionResult.type.toUpperCase()}
            </Text>
          </Flex>
          <Flex className="mt-3">
            <Text>Time</Text>
            <Text className="text-right">
              {formatDistanceToNowStrict(data.timestamp)} ago
            </Text>
          </Flex>
          <Flex className="mt-3">
            <Text>Status</Text>
            <Status
              error={data.errorData}
              isWarning={data.innerOperationFailed}
            />
          </Flex>
          <Flex className="mt-3">
            <Text>Gas Used</Text>
            <Text className="text-right">{data.trace.gasUsedParsed}</Text>
          </Flex>
          <Flex className="mt-3">
            <Text>Gas Price</Text>
            <Text className="text-right">
              {ethers.utils.formatUnits(data.transaction.gasPrice, 'gwei')} gwei
            </Text>
          </Flex>
          <Flex className="mt-3">
            <Text>Transaction Fee</Text>
            <Text className="text-right">
              {ethers.utils.formatEther(data.fee)} {data.chain.currency}{' '}
              {data.feeInUSD ? ` (${formatUSD(data.feeInUSD)})` : ''}
            </Text>
          </Flex>
        </Card>
        <ERC4337Component data={data.erc4337} chain={data.chain} />
        <SafeComponent data={data.safe} />
      </Grid>
      <Visualization data={data} />
      <Card className="mt-8">
        <Title>Interaction Flow</Title>
        <ParentSize>
          {({ width, height }) => (
            <TransactionFlow
              width={width - 10}
              height={700}
              data={renameKeys(data.trace)}
            />
          )}
        </ParentSize>
      </Card>
    </main>
  );
};

const ERC4337Component: FC<{ chain: Chain, data?: ERC4337Data }> = ({ chain, data }) => {
  if (!data) return null
  // currently supports only 1
  const userOp = data.userOps?.[0]
  if (!userOp) return null
  const paymasterGasCost = userOp.paymaster?.actualGasCost
  const paymasterUsed = userOp.paymaster?.address && paymasterGasCost
  const paymasterGasCostInUSD = userOp.paymaster?.actualGasCostInUSD && formatUSD(userOp.paymaster.actualGasCostInUSD)
  const bundlerCompensation = BigNumber.from(data.bundlerCompensation || 0)
  const bundlerCompensationInUSD = formatUSD(data.bundlerCompensationInUSD || 0);
  return (
    <Card key='erc4337'>
      <Flex
        justifyContent="start"
        alignItems="baseline"
        className="space-x-2"
      >
        <Title>ERC4337</Title>
        <Subtitle>UserOp</Subtitle>
      </Flex>
      <Flex className="mt-6">
        <Text>Bundler Compensation</Text>
        <Text className={`text-right ${bundlerCompensation.isNegative() ? 'text-red-600' : ''}`}>{ethers.utils.formatEther(bundlerCompensation)} {chain.currency} {bundlerCompensationInUSD && ` (${bundlerCompensationInUSD})`}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>New Smart Account Created</Text>
        <Text className="text-right">{userOp.accountFactory ? 'Yes' : 'No'}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>Paymaster Used</Text>
        <Text className="text-right">{paymasterUsed ? 'Yes' : 'No'}</Text>
      </Flex>
      {paymasterUsed && (
        <Flex className="mt-6">
          <Text>Amount Processed By Paymaster</Text>
          <Text className="text-right">{ethers.utils.formatEther(paymasterGasCost || 0)} {chain.currency} {paymasterGasCostInUSD && ` (${paymasterGasCostInUSD})`}</Text>
        </Flex>
      )}
    </Card>
  )
}

const SafeComponent: FC<{ data?: SafeData }> = ({ data }) => {
  if (!data) return null

  return (
    <Card key='safe'>
      <Flex
        justifyContent="start"
        alignItems="baseline"
        className="space-x-2"
      >
        <Title>Safe Transaction</Title>
        <CopyToClipboardText text={data.transaction.safeTxHash} />
      </Flex>
      <Flex className="mt-6">
        <Text>Nonce</Text>
        <Text className='text-right'>{data.transaction.nonce}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>Confirmations</Text>
        <Text className='text-right'>{data.transaction.confirmations?.length || 0}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>Confirmations Required</Text>
        <Text className='text-right'>{data.transaction.confirmationsRequired || 0}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>Origin</Text>
        <Text className='text-right'>{data.transaction.origin}</Text>
      </Flex>
      <Flex className="mt-6">
        <Text>Trusted</Text>
        <Text className='text-right'>{data.transaction.trusted ? 'True' : 'False'}</Text>
      </Flex>
    </Card>
  )
}

const Status: FC<{ error?: TransactionError, isWarning: boolean }> = ({ error, isWarning }) => {
  let className = 'text-green-600', text = 'Success'
  if (error) {
    text = `${error.message || 'Failure'}: ${error.decoded}`
    className = 'text-red-600'
  } else if (isWarning) {
    text = 'Success (with internal failures)'
    className = 'text-yellow-600'
  }
  return (
    <Text className={`text-right ${className}`}>{text}</Text>
  )
}

const StatusHeader: FC<{ error?: TransactionError, isWarning: boolean }> = ({ error, isWarning }) => {
    let className = 'text-green-600', text = 'Success'
    if (error) {
      text = `Reverted`
      className = 'text-red-600'
    } else if (isWarning) {
      text = 'Success'
      className = 'text-yellow-600'
    }
    return (
      <Metric className={`${className}`}>{text}</Metric>
    )
  }

const CopyToClipboardText = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className='cursor-pointer flex items-center' onClick={copyTextToClipboard}>
      <Subtitle className='mr-2'>{shortenHex(text)}</Subtitle>
      {copied ? <MdCheckCircle color="green" /> : <MdContentCopy />}
    </div>
  );
};