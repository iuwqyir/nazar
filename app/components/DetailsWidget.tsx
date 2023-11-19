import { Card, Metric, Text, Flex, Button, Callout, Grid } from "@tremor/react";

import {
  CogIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import SubscribeButton from "./subscribeButton";

const categories = [
  {
    title: "Type",
    metric: "SAFE",
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
    status: "Performing as usual",
    color: "emerald",
  },
  {
    title: "Profit",
    metric: "$ 12,789",
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
    status: "Immediate action required",
  },
  {
    title: "Status",
    metric: "Success",
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
    status: "Critical performance",
  },
//   {
//     title: "Orders",
//     metric: "1,789",
//     text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
//     status: "Performing as usual",
//   },
];

// const statusMapping = {
//   "Performing as usual": { icon: CheckCircleIcon, color: "emerald" },
//   "Immediate action required": { icon: ShieldExclamationIcon, color: "rose" },
//   "Critical performance": { icon: CogIcon, color: "amber" },
// };
type DetailsWidgetProps = {
    type: string;
    status: string;
    fees: string;
    feesTitle: string
  };

export default function DetailsWidget({ type, status, fee, feesTitle }) {
  return (
    <Grid numItemsSm={3} className="gap-6">
      {/* {categories.map((item) => ( */}
        <Card key='type'>
          <Text>Type</Text>
          <Metric>{type}</Metric>
          <SubscribeButton />
          {/* <Callout
            className="mt-6"
            title={item.status}
            // icon={statusMapping[item.status].icon}
            // color={statusMapping[item.status].color}
          >
            {item.text}
          </Callout> */}
          {/* <Flex className="mt-6 pt-4 border-t">
            <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right">
              View more
            </Button>
          </Flex> */}
        </Card>
        <Card key='Fees'>
          <Text>{feesTitle}</Text>
          <Metric>{fee}</Metric>
          {/* <Callout
            className="mt-6"
            title={item.status}
            // icon={statusMapping[item.status].icon}
            // color={statusMapping[item.status].color}
          >
            {item.text}
          </Callout> */}
          {/* <Flex className="mt-6 pt-4 border-t">
            <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right">
              View more
            </Button>
          </Flex> */}
        </Card>
        <Card key='status'>
          <Text>Status</Text>
          <Metric>{status}</Metric>
          {/* <Callout
            className="mt-6"
            title={item.status}
            // icon={statusMapping[item.status].icon}
            // color={statusMapping[item.status].color}
          >
            {item.text}
          </Callout> */}
          {/* <Flex className="mt-6 pt-4 border-t">
            <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right">
              View more
            </Button>
          </Flex> */}
        </Card>
      {/* ))} */}
    </Grid>
  );
}