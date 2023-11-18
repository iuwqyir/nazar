import { Card, Title, Text } from '@tremor/react';
import Search from './search';
import TransactionsTable from './components/transactionsTable'

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const search = searchParams.q ?? '';
  const users = [] as User[]


  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
    <div className="flex flex-col items-center justify-center">
        <h1 className="text-9xl font-extrabold text-blue-900 mb-4">🧿</h1>
    </div>
      <Search />



    <Card className="mt-6 bg-transparent">
        {/* <UsersTable users={users} /> */}
        <TransactionsTable />
    </Card>

    </main>
  );
}
