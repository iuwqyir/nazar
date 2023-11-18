'use client'; 
// import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";
import { useW3iAccount } from "@web3inbox/widget-react";
import { Callout, Card} from '@tremor/react';
import { INotification } from "./types";
import { sendNotification } from "./fetchNotify";

function useSendNotification() {
  const [isSending, setIsSending] = useState<boolean>(false);
  // const toast = useToast();
  const { account } = useW3iAccount();

  const handleSendNotification = useCallback(
    async (notification: INotification) => {
      if (!account) {
        return;
      }
      setIsSending(true);
      try {
        const { success, message } = await sendNotification({
          accounts: [account],
          notification,
        });
        setIsSending(false);
        console.log(success ? "success" : "error")
        console.log(success ? notification.title : "Message failed.")
        //   status: success ? "success" : "error",
        //   position: "top",
        //   variant: "subtle",
        //   colorScheme: success ? "purple" : "red",
        //   title: success ? notification.title : "Message failed.",
        // });
      } catch (error: any) {
        setIsSending(false);
        console.error({ sendNotificationError: error });
        console.log("error")
        console.log(error.message)
        console.log( error.cause)
        // toast({
        //   status: "error",
        //   title: error.message,
        //   description: error.cause,
        // });
      }
    },
    [account]
  );

  return {
    handleSendNotification,
    isSending,
  };
}

export default useSendNotification;
