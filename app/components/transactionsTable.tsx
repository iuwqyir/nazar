'use client';

import {
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableBody,
    Badge,
    Button,
  } from "@tremor/react";
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
  
  const colors = {
    "erc4337": "cyan",
    'safe': "green",
    Shipped: "emerald",
    "celo": "yellow",
    "polygon": "purple",
    "ethereum": "blue"
  };
  
  export default function TransactionsTable() {
    const [transactions, setTransactions] = useState([])
    const router = useRouter();

    const getTransactions = () => {
        fetch('/api/transactions', {
            headers: {
              'Content-Type': 'application/json',
            }
          }).then((r) => {
            r.json().then((result) => {
                console.log(result)
                setTransactions(result.data)
                return result
            })
          })
    }

    useEffect(() => {
        getTransactions()
    }, [])

    function forwardToDetails(chain, transactionHash) {
        router.push(`/account-abstraction/${chain}/0x${transactionHash}`);
    }

    return (
        <Table>
          <TableHead>
            <TableRow>
            <TableHeaderCell>Timestamp</TableHeaderCell>
              <TableHeaderCell>Transaction Hash</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Chain</TableHeaderCell>
              <TableHeaderCell>Explore</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((item: any) => (
              <TableRow key={item.hash}>
                <TableCell>{new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}</TableCell>
                <TableCell>{`0x${item.hash}`}</TableCell>
                <TableCell>
                  <Badge color={colors[item.aaType]} size="xs">
                    {item.aaType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={colors[item.chain]} size="xs">
                    {item.chain === 'ethereum' ? 'Ethereum Mainnet' : item.chain}
                  </Badge>
                </TableCell>
                <TableCell>
                    
                  <Button size="sm" color={colors[item.aaType]} variant="secondary" onClick={() => forwardToDetails(item.chain === "Ethereum Mainnet" ? 'ethereum' : item.chain, item.hash)}>
                    {/* View more */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                    </svg>


                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  }