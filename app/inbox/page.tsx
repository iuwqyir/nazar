"use client";
import { useCallback, useEffect, useState } from "react";
import React from 'react';
import { 
    Button,
    Grid,
    Col,
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
    Metric,
    NumberInputProps,
    TextInput,
    Switch} from '@tremor/react';
import Link from 'next/link';
import { BellIcon, BellSlashIcon, BoltIcon, ExclamationTriangleIcon, FireIcon, InformationCircleIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowUpRightIcon, XCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";


import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
  useSubscriptionScopes,
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
    const [noOfAlerts, setNoOfAlerts] = useState(0);
    const [noOfWarnings, setNoOfWarnings] = useState(0);
    const [noOfInfos, setNoOfInfos] = useState(0);

    const {messages, deleteMessage } = useMessages(account)
    const { scopes, updateScopes } = useSubscriptionScopes(account)
    
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
        const alertMessages = messages.filter(message => message.message?.type === 'fe8b4821-0e89-4b73-82ab-e9bbc484ac1a');
        setNoOfAlerts(alertMessages.length);
        const warningMessages = messages.filter(message => message.message?.type === '71a900cb-d41c-4b52-939e-3177d75f32c8');
        setNoOfWarnings(warningMessages.length)
        const infoMessages = messages.filter(message => message.message?.type === '30e53997-1fa5-498f-bf10-3a93c01f6a09');
        setNoOfInfos(infoMessages.length)

    }, [address, setAccount, messages, scopes, setNoOfAlerts, setNoOfWarnings, setNoOfInfos]);

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

    const handleSwitchChange = useCallback(
        async (messageType: string) => {
            if (!Boolean(address)) return;

            const scopesArray = Object.values(scopes);

            let newScopesArray = scopesArray
            .filter(scope => scope.id !== messageType)  // Exclude the current scope
            .filter(scope => scope.enabled)
            .map(scope => scope.id); 

            if (!scopes[messageType].enabled) {
                newScopesArray.push(messageType);
            }
            console.log(newScopesArray)
            updateScopes(newScopesArray);

    }, [address, scopes, updateScopes])

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
    <main className="p-2 md:p-4 mx-auto max-w-7xl">
        <div>
        <Flex flexDirection="col">
        </Flex>
        <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-x-2" >
            <Col className="flex flex-col space-y-2">
                {/*stats */}
                <Card className="h-1/4">
                    <Flex justifyContent="start">
                        <Icon color='zinc' icon={BellIcon}/>
                        <Text className="w-1/3">Total notifications received</Text> 
                        <Flex justifyContent="end" className="w-1/3">
                            <Metric>{messages?.length}</Metric>
                        </Flex>
                    </Flex>
                    <Flex justifyContent="start">
                        <Icon color='red' icon={FireIcon}/>
                        <Text className="w-1/3">Severe alerts received</Text>
                        <Flex justifyContent="end" className="w-1/3">
                            <Metric>{noOfAlerts}</Metric>
                        </Flex>
                    </Flex>
                    <Flex justifyContent="start">
                        <Icon color='orange' icon={ExclamationTriangleIcon}/>
                        <Text className="w-1/3">Warnings received</Text> 
                        <Flex justifyContent="end" className="w-1/3">
                            <Metric>{noOfWarnings}</Metric>
                        </Flex>
                    </Flex>
                    <Flex justifyContent="start">
                        <Icon color='blue' icon={InformationCircleIcon}/>
                        <Text className="w-1/3">Infos received</Text> 
                        <Flex justifyContent="end" className="w-1/3">
                            <Metric>{noOfInfos}</Metric>
                        </Flex>
                    </Flex>
                </Card>
                {/*alerts, warning and infos*/}
                <Card className="h-3/4">
                    <Title>
                        <Icon size="md" color="red" icon={BellIcon} />
                        Latest notifications
                    </Title>
                    <AccordionList className="h-5/6">
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

            </Col>
            {/*Preferences*/}
            <Col className="flex flex-col space-y-2">
                <Card className="h-1/4">
                    <Title>Preferences</Title>
                    <Text> Toggle the switches to turn specific notifications on and off</Text>
                    <Flex justifyContent="start" className="mt-3 mb-3">
                        <Switch id="alertswitch" checked={isSubscribed && scopes['fe8b4821-0e89-4b73-82ab-e9bbc484ac1a'].enabled ? true : false} disabled={!isW3iInitialized || !account || !isSubscribed ? true : false} name="alertswitch" onChange={() => handleSwitchChange('fe8b4821-0e89-4b73-82ab-e9bbc484ac1a')}/>
                        <label htmlFor="alertswitch" className="text-sm text-gray-500 mr-5">Alerts</label>
                        <Switch id="warningswitch" checked={isSubscribed && scopes['71a900cb-d41c-4b52-939e-3177d75f32c8'].enabled ? true : false} disabled={!isW3iInitialized || !account || !isSubscribed ? true : false} name="warningswitch" onChange={() => handleSwitchChange('71a900cb-d41c-4b52-939e-3177d75f32c8')}/>
                        <label htmlFor="warningswitch" className="text-sm text-gray-500 mr-5">Warnings</label>
                        <Switch id="infoswitch" checked={isSubscribed && scopes['30e53997-1fa5-498f-bf10-3a93c01f6a09'].enabled ? true : false} disabled={!isW3iInitialized || !account || !isSubscribed ? true : false} name="infoswitch" onChange={() => handleSwitchChange('30e53997-1fa5-498f-bf10-3a93c01f6a09')}/>
                        <label htmlFor="infoswitch" className="text-sm text-gray-500 mr-5">Infos</label>
                        <Switch id="communityswitch" checked={isSubscribed && scopes['5c4db383-3c63-4320-81cb-e421cf0e8727'].enabled ? true : false} disabled={!isW3iInitialized || !account || !isSubscribed ? true : false} name="communityswitch" onChange={() => handleSwitchChange('5c4db383-3c63-4320-81cb-e421cf0e8727')}/>
                        <label htmlFor="communityswitch" className="text-sm text-gray-500 mr-5">Comments</label>
                    </Flex>
                    {!identityKey ? (
                        <Button 
                            onClick={handleRegistration}
                            disabled={!isW3iInitialized || !account}
                            loading={isRegistering}
                            loadingText="Registering..."
                            icon={BoltIcon}> 
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
                                        variant="secondary"> 
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
                        )}
                </Card>
                
                {/*community chat */}
                <Card className="h-3/4">
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
                        <div className="p-2">
                            <TextInput placeholder="Start writing (max 200 char)"
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={200} />
                        </div>
                        <div className="flex flex-row p-2 space-between">
                            <TextInput 
                            placeholder="Insert message ID to comment on" 
                            onChange={(e) => setMessageID(e.target.value)}/>
                            <Button onClick={() => handleComment(messageID, comment)} className="ml-2">Comment</Button>
                        </div>


                    </form>
                </Card>             
                </Col>
        </Grid>
        </div>
    </main>
    )
}