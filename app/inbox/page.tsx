"use client";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import React from 'react';
import { Button, Flex, Accordion, AccordionList} from '@tremor/react';

import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";
import { useWeb3ModalAccount, useWeb3ModalSigner } from '@web3modal/ethers5/react'

import useSendNotification from "./utils/useSendNotification";
import Messages from "./components/Messages";
import Subscription from "./components/Subscription";
import { sendNotification } from "./utils/fetchNotify";
import { truncate } from "fs/promises";

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
    } = useW3iAccount();
    const {
        subscribe,
        unsubscribe,
        isSubscribed,
        isSubscribing,
        isUnsubscribing,
    } = useManageSubscription(account);
    
    const { signer } = useWeb3ModalSigner()
    const { address, isConnected } = useWeb3ModalAccount()

    const { handleSendNotification, isSending } = useSendNotification();
    const [lastBlock, setLastBlock] = useState<string>();
    const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] =
        useState(true);

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
    }, [signMessage, address, setAccount]);

    const handleRegistration = useCallback(async () => {
        if (!account) return;
        try {
        await registerIdentity(signMessage);
        } catch (registerIdentityError) {
        console.error({ registerIdentityError });
        }
    }, [signMessage, registerIdentity, account]);

    useEffect(() => {
            // register even if an identity key exists, to account for stale keys
            handleRegistration();
        }, [handleRegistration]);

        const handleSubscribe = useCallback(async () => {
        if(!identityKey) {
        await handleRegistration();
        }

        await subscribe();
    }, [subscribe, identityKey])

    // handleSendNotification will send a notification to the current user and includes error handling.
    // If you don't want to use this hook and want more flexibility, you can use sendNotification.
    const handleTestNotification = useCallback(async () => {
        if (isSubscribed) {
        handleSendNotification({
            title: "Alert",
            body: "🧿 alert to keep you safe on chain my fren!",
            icon: `${window.location.origin}/WalletConnect-blue.svg`,
            url: window.location.origin,
        // ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
            type: "fe8b4821-0e89-4b73-82ab-e9bbc484ac1a",
        });
        }
    }, [handleSendNotification, isSubscribed]);

    return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-9xl font-extrabold text-blue-900 mb-4">🧿</h1>
        </div>
        <div>
        <Flex flexDirection="col">
            {isSubscribed ? (
            <Flex flexDirection={"col"} alignItems="center">
                <Button 
                    onClick={handleTestNotification}
                    disabled={!isW3iInitialized}
                    loading={isSending}
                    loadingText="Sending..."> 
                    Send test notification
                </Button>
                <Button
                    onClick={unsubscribe}
                    disabled={!isW3iInitialized || !account}
                    loading={isUnsubscribing}
                    loadingText="Unsubscribing..."
                >
                    Unsubscribe
                </Button>
            </Flex>
            ) : (
                <Button
                    onClick={handleSubscribe}
                    loading={isSubscribing}
                    loadingText="Subscribing..."
                    disabled={!Boolean(address) || !Boolean(account)}
                >
                    Subscribe
                </Button>
            )}

            {isSubscribed && (
                <AccordionList>
                    <Subscription />
                    <Messages />
                </AccordionList>
            )}
        </Flex>
        </div>
    </main>
    )
}

