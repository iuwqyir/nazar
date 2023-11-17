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
  
  const colors = {
    "Ready for dispatch": "gray",
    Cancelled: "rose",
    Shipped: "emerald",
    "💛 celo": "yellow",
    "💜 polygon": "purple",
    "💙 ethereum": "blue"
  };
  
  const transactions = [
    // Your existing first transaction already has a transactionHash key
    {
      transactionHash: "0x23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      user: "Lena Mayer",
      item: "Under Armour Shorts",
      status: "💛 celo",
      amount: "$ 49.90",
      link: "#",
    },
    // The rest of the transactions need to be updated
    {
      transactionHash: "0x23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      user: "Max Smith",
      item: "Book - Wealth of Nations",
      status: "💙 ethereum",
      amount: "$ 19.90",
      link: "#",
    },
    {
      transactionHash: "0x3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
      user: "Anna Stone",
      item: "Garmin Forerunner 945",
      status: "💙 ethereum",
      amount: "$ 499.90",
      link: "#",
    },
    {
      transactionHash: "0x4567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      user: "Truls Cumbersome",
      item: "Running Backpack",
      status: "💜 polygon",
      amount: "$ 89.90",
      link: "#",
    },
    {
      transactionHash: "0x5678901abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
      user: "Peter Pikser",
      item: "Rolex Submariner Replica",
      status: "💛 celo",
      amount: "$ 299.90",
      link: "#",
    },
    {
      transactionHash: "0x6789012abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
      user: "Phlipp Forest",
      item: "On Clouds Shoes",
      status: "💜 polygon",
      amount: "$ 290.90",
      link: "#",
    },
    {
      transactionHash: "0x78901234abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      user: "Mara Pacemaker",
      item: "Ortovox Backpack 40l",
      status: "💜 polygon",
      amount: "$ 150.00",
      link: "#",
    },
    {
      transactionHash: "0x89012345abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
      user: "Sev Major",
      item: "Oakley Jawbreaker",
      status: "💙 ethereum",
      amount: "$ 190.90",
      link: "#",
    },
  ];  
  
  export default function TransactionsTable() {
    return (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Transaction ID</TableHeaderCell>
              <TableHeaderCell>chain</TableHeaderCell>
              <TableHeaderCell>Explore</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((item) => (
              <TableRow key={item.transactionHash}>
                <TableCell>{item.transactionHash}</TableCell>
                <TableCell>
                  <Badge color={colors[item.status]} size="xs">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="secondary" color="gray">
                    expand
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  }