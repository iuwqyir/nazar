"use client";
import { useCallback, useEffect, useState } from "react";
import React from 'react';
import { Button, Flex, Text, Accordion, AccordionList} from '@tremor/react';

import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
  useSubscription
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";
import { useWeb3ModalAccount, useWeb3ModalSigner } from '@web3modal/ethers5/react'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;


export default function InboxPage() {
/** Web3Inbox SDK hooks **/
    const isW3iInitialized = useInitWeb3InboxClient({
        projectId,
        domain: appDomain,
        isLimited: false,
    });
    const {
        account,
        setAccount,
        register: registerIdentity,
        identityKey,
        isRegistering
    } = useW3iAccount();
    const {
        subscribe,
        unsubscribe,
        isSubscribed,
        isSubscribing,
        isUnsubscribing,
    } = useManageSubscription(account);

    // get specific account's subscription to specific dapp
    const { subscription } = useSubscription(account, appDomain)
    
    const { signer } = useWeb3ModalSigner()
    const { address, isConnected } = useWeb3ModalAccount()


    const signMessage = useCallback(
        async (message: string) => {
        if (!signer) {
            throw new Error("No signer available");
        }
        const res = await signer.signMessage(message);
        if (res === undefined) {
            throw new Error("Failed to sign the message");
        }

        return res as string;
        },
        [signer]
    );

    // We need to set the account as soon as the user is connected
    useEffect(() => {
        if (!Boolean(address)) return;
        setAccount(`eip155:1:${address}`);
    }, [address, setAccount]);

    const handleRegistration = useCallback(async () => {
        if (!account) return;
        try {
        await registerIdentity(signMessage);
        } catch (registerIdentityError) {
        console.error({ registerIdentityError });
        }
    }, [signMessage, registerIdentity, account]);

  

    return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-9xl font-extrabold text-blue-900 mb-4">🧿</h1>
        </div>
        <div>
        <Flex flexDirection="col">
        { !identityKey ? (
                <Flex flexDirection={"col"} alignItems="center">
                    <Text> Please register to use Nazar with Web3Inbox </Text>
                    <Button 
                    onClick={handleRegistration}
                    disabled={!isW3iInitialized || !account}
                    loading={isRegistering}
                    loadingText="Registering..."> 
                    Register
                </Button>
                </Flex>
            ) : (
                <Flex flexDirection="col">
                    {isSubscribed ? (
                    <Flex flexDirection={"col"} alignItems="center">
                        <Button 
                            onClick={unsubscribe}
                            disabled={!isW3iInitialized || !account}
                            loading={isUnsubscribing}
                            loadingText="Unsubscribing..."> 
                            Unsubscribe
                        </Button>
                    </Flex>
                    ) : (
                        <Button
                            onClick={subscribe}
                            disabled={!isW3iInitialized || !account}
                            loading={isSubscribing}
                            loadingText="Subscribing..."
                        >
                            Subscribe
                        </Button>
                    )}
                </Flex>
            )

            }
        </Flex>
        </div>
    </main>
    )
}
