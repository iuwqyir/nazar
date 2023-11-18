'use client';
import { Button, Accordion, AccordionBody} from '@tremor/react';
import { useSubscription, useW3iAccount } from "@web3inbox/widget-react";
import React from "react";

function Subscription() {
  const { account } = useW3iAccount();
  const { subscription } = useSubscription(account);

  return (
    <Accordion>
      <h2>
        <Button>
          <h3>
            Subscription
          </h3>
        </Button>
      </h2>
      <AccordionBody>
            {JSON.stringify(subscription, undefined, 2)}
      </AccordionBody>
    </Accordion>
  );
}

export default Subscription;
