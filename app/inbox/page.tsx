"use client";
import { useCallback, useEffect, useState } from "react";
import React from 'react';
import { 
    Button,
    Flex,
    Text,
    Title,
    Accordion,
    AccordionList,
    Card,
    AccordionHeader,
    AccordionBody,
    Icon,
    Badge,
    NumberInputProps,
    TextInput,
    Switch} from '@tremor/react';
import Link from 'next/link';
import { BellIcon, BellSlashIcon, BoltIcon, ExclamationTriangleIcon, FireIcon, InformationCircleIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowUpRightIcon, XCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";


import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
  useSubscription,
  useMessages
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";
import { useWeb3ModalAccount, useWeb3ModalSigner } from '@web3modal/ethers5/react'
import useSendNotification from "./utils/useSendNotification";
import { sendNotification } from "./utils/fetchNotify";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

const messageIcons = {
   // alert: fe8b4821-0e89-4b73-82ab-e9bbc484ac1a
    // warning: 71a900cb-d41c-4b52-939e-3177d75f32c8
    // info: 30e53997-1fa5-498f-bf10-3a93c01f6a09
    "fe8b4821-0e89-4b73-82ab-e9bbc484ac1a": {
        "icon": FireIcon,
        "type": "alert",
        "iconColor": "red"},
    "71a900cb-d41c-4b52-939e-3177d75f32c8": {
        "icon":ExclamationTriangleIcon,
        "type": "warning",
        "iconColor": 'orange'}, 
    "30e53997-1fa5-498f-bf10-3a93c01f6a09": {
        "icon":InformationCircleIcon,
        "type": "info",
        "iconColor": 'blue'},
    "5c4db383-3c63-4320-81cb-e421cf0e8727": {
        "icon":ChatBubbleOvalLeftEllipsisIcon,
        "type": "community",
        "iconColor": 'black'}
}


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
    const [comment, setComment] = useState('');
    const [messageID, setMessageID] = useState('');

    const {messages, deleteMessage } = useMessages(account)
    console.log(messages)
    
    const { signer } = useWeb3ModalSigner()
    const { address } = useWeb3ModalAccount()
    const { handleSendNotification, isSending } = useSendNotification();


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

    const handleDeletion = useCallback(
        async (id: number) => {
            if (!Boolean(address)) return;
            deleteMessage(id);

    }, [address, deleteMessage])

    const handleCopyToClipboard = async (id: number) => {
    try {
      // Use the Clipboard API to copy text to the clipboard
      await navigator.clipboard.writeText(id.toString());
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Unable to copy text to clipboard', err);
    }
  };

   const handleComment = useCallback(async (messageID, comment) => {
    if (isSubscribed) {
      handleSendNotification({
        title: messageID.toString(),
        body: comment,
	// ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
        type: "fe8b4821-0e89-4b73-82ab-e9bbc484ac1a",
      });
    }
  }, [handleSendNotification, isSubscribed]);


    return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
        {/* <div className="flex flex-col items-center justify-center">
            <h1 className="text-9xl font-extrabold text-blue-900 mb-4">🧿</h1>
        </div> */}
        <div>
        <Flex flexDirection="col">
        { !identityKey ? (
                <Flex flexDirection={"col"} alignItems="center">
                    <Text> Please register to use Nazar with Web3Inbox </Text>
                    <Button 
                    onClick={handleRegistration}
                    disabled={!isW3iInitialized || !account}
                    loading={isRegistering}
                    loadingText="Registering..."
                    icon={BoltIcon}> 
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
                            loadingText="Unsubscribing..."
                            icon={BellSlashIcon}
                            color='gray'
                            variant="secondary"> 
                            Unsubscribe
                        </Button>
                    </Flex>
                    ) : (
                        <Button
                            onClick={subscribe}
                            disabled={!isW3iInitialized || !account}
                            loading={isSubscribing}
                            loadingText="Subscribing..."
                            icon={BellIcon}
                        >
                            Subscribe
                        </Button>
                    )}
                </Flex>
            )

            }
        </Flex>
        <Flex alignItems='stretch' justifyContent='between' className="p-4 mt-5 items-start">
            {/* First Card  are the alerts, warning and infos*/}
            <Card>
                <Title>
                    <Icon size="md" color="red" icon={BellIcon} />
                    Latest notifications
                </Title>
                <AccordionList className="h-80">
                    {!messages?.length ? (
                        <Accordion><Text>No messages yet.</Text></Accordion>
                    ) : (
                        // Use filter to get messages of type
                        // alert: fe8b4821-0e89-4b73-82ab-e9bbc484ac1a
                        // warning: 71a900cb-d41c-4b52-939e-3177d75f32c8
                        // info: 30e53997-1fa5-498f-bf10-3a93c01f6a09
                        messages
                        .filter(message => message.message?.type === 'fe8b4821-0e89-4b73-82ab-e9bbc484ac1a' || message.message?.type === '71a900cb-d41c-4b52-939e-3177d75f32c8'  || message.message?.type === '30e53997-1fa5-498f-bf10-3a93c01f6a09')
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 5)
                        .map(({ id, message, publishedAt }) => (
                            <Accordion key={id} className="flex flex-col items-center justify-between">
                                <AccordionHeader className="flex flex-row items-center">
                                    <Icon color={message.type == undefined ? 'gray' : messageIcons[message.type]["iconColor"]} icon={message.type == undefined ? BellIcon : messageIcons[message.type]["icon"]} />
                                    <Badge size="xs" className="ml-5" color={message.type == undefined ? 'gray' : messageIcons[message.type]["iconColor"]}>{message.type == undefined ? null : messageIcons[message.type]["type"]}</Badge>
                                    <Text className="ml-5"> {message.title}</Text>
                                    <Text className="ml-5"> {new Date(publishedAt).toLocaleString('en-US')}</Text>
                                </AccordionHeader>
                                <AccordionBody className="flex flex-row  items-center justify-between">
                                    <Button onClick={() => handleCopyToClipboard(id)} className="ml-2" variant='secondary' size = "xs" icon={ClipboardIcon}> Copy Message ID</Button>
                                    <Link href={message.url}>
                                            <Button size="xs" variant='secondary' icon={ArrowUpRightIcon}> Open analyzer</Button>
                                    </Link>
                                    <Button onClick={() => handleDeletion(id)} variant='secondary' size = "xs" icon={XCircleIcon} color='gray'> Mark irrelevant</Button>
                                </AccordionBody>
                            </Accordion>
                        ))
                    )}
                </AccordionList>
            </Card>
            {/* Second Card is the community chat */}
            <Card>
                <Title>
                    <Icon size="md" color="blue" icon={ChatBubbleOvalLeftEllipsisIcon} />
                    Latest comments on transactions
                </Title>
                <AccordionList className="h-80">
                    {!messages?.length ? (
                        <Accordion><Text>No messages yet.</Text></Accordion>
                    ) : (
                        // Use filter to get messages of type
                        // community: 5c4db383-3c63-4320-81cb-e421cf0e8727
                        messages
                        .filter(message => message.message?.type === '5c4db383-3c63-4320-81cb-e421cf0e8727')
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 5)
                        .map(({ id, message }) => (
                            <Accordion key={id} className="flex flex-col items-center justify-center">
                                <AccordionHeader className="flex items-center space-x-2">
                                    <Text>{message.body}</Text>
                                </AccordionHeader>
                                <AccordionBody>
                                    <div>{messages[0].message.title} </div>
                                </AccordionBody>
                            </Accordion>
                        ))
                    )}
                </AccordionList>
                <form className="flex flex-col mt-5">
                    <div>
                        <TextInput placeholder="Start writing (max 200 char)"
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={200} />
                    </div>
                    <div className="flex flex-row">
                        <TextInput 
                        placeholder="Insert message ID to comment on" 
                        onChange={(e) => setMessageID(e.target.value)}/>
                        <Button onClick={() => handleComment(messageID, comment)}>Comment</Button>
                    </div>


                </form>
            </Card>
            <Card>
                <Flex>
                    <Button> Unsubscribe all button</Button>
                    <Switch> Toggle Switch for preferences</Switch>
                </Flex>
            </Card>
        </Flex>
        </div>
    </main>
    )
}