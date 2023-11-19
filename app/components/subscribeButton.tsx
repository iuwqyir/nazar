"use client";

import { useCallback, useEffect, useState } from "react";
import React from 'react';
import { 
    Button,
    Flex,
} from '@tremor/react';
import { BellIcon, BellSlashIcon, BoltIcon} from "@heroicons/react/24/outline";
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";
import { useWeb3ModalAccount, useWeb3ModalSigner } from '@web3modal/ethers5/react'
import { isAddress } from "ethers/lib/utils";


const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

export default function SubscribeButton() {
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
    const { signer } = useWeb3ModalSigner()
    const { address } = useWeb3ModalAccount()

    useEffect(() => {
        if (!Boolean(address)) return;
        setAccount(`eip155:1:${address}`);
    }, [address, setAccount])

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


    const handleRegistration = useCallback(async () => {
        if (!account) return;
        try {
        await registerIdentity(signMessage);
        } catch (registerIdentityError) {
        console.error({ registerIdentityError });
        }
    }, [signMessage, registerIdentity, account]);

  return (
    <div>
    {!identityKey ? (
        <Button 
            onClick={handleRegistration}
            disabled={!isW3iInitialized || !account}
            loading={isRegistering}
            loadingText="Registering..."
            icon={BoltIcon}
        > 
            Register
        </Button>
    ) : ( 
        <Flex flexDirection="col">
            {isSubscribed ? (
                <Flex flexDirection={"col"} alignItems="start">
                    <Button 
                        onClick={unsubscribe}
                        disabled={!isW3iInitialized || !account}
                        loading={isUnsubscribing}
                        loadingText="Unsubscribing..."
                        icon={BellSlashIcon}
                        color='red'
                        variant="secondary"
                    > 
                        Unsubscribe all
                    </Button>
                </Flex> 
                ) :(
                    <Flex flexDirection={"col"} alignItems="start">
                        <Button
                            onClick={subscribe}
                            disabled={!isW3iInitialized || !account}
                            loading={isSubscribing}
                            loadingText="Subscribing..."
                            icon={BellIcon}
                        >
                            Subscribe
                        </Button>
                    </Flex> 
                    )}
            </Flex>
            )
    }
    </div>
    )
}