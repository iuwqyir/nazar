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
    "Ready for dispatch": "gray",
    Cancelled: "rose",
    Shipped: "emerald",
    "💛 celo": "yellow",
    "💜 polygon": "purple",
    "💙 ethereum": "blue"
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
                  <Badge color={colors[item.chain]} size="xs">
                    {item.chain}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="secondary" color="gray" onClick={() => forwardToDetails(item.chain === "Ethereum Mainnet" ? 'ethereum' : item.chain, item.hash)}>
                    expand
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  }