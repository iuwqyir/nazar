import { Button, Accordion, AccordionBody, Text, Callout} from '@tremor/react';
import { useMessages, useW3iAccount } from "@web3inbox/widget-react";
import Link from "next/link";
import React from "react";

function Messages() {
  const { account } = useW3iAccount();
  const { messages, deleteMessage } = useMessages(account);

  return (
    <Accordion>
      <Button> 
        <h3>
          Last Messages
        </h3>
      </Button>
      <div>
        <AccordionBody
        >
          {!messages?.length ? (
            <Text>No messages yet.</Text>
          ) : (
            messages
              .sort((a, b) => b.id - a.id)
              .map(({ id, message }) => (
                <Callout
                  title={message.url}
                  key={id}
                  color={
                    message.type === "transactional" ? "blue" : "purple"
                  }
                >

                  <div>
                    <Callout
                    title={message.body}>
                      {message.body}
                    </Callout>
                  </div>
                </Callout>
              ))
          )}
        </AccordionBody>
      </div>
    </Accordion>
  );
}

export default Messages;
