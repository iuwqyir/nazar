import { Card, Title, Text } from '@tremor/react';
import Search from './search';
import UsersTable from './table';
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
//   const result = await sql`
//     SELECT id, name, username, email 
//     FROM users 
//     WHERE name ILIKE ${'%' + search + '%'};
//   `;
//   const users = [
//     {"id": 1, "name": "User 1", "username": "user1", "email": "user1@example.com"},
//     {"id": 2, "name": "User 2", "username": "user2", "email": "user2@example.com"},
//     {"id": 3, "name": "User 3", "username": "user3", "email": "user3@example.com"},
//     {"id": 4, "name": "User 4", "username": "user4", "email": "user4@example.com"},
//     {"id": 5, "name": "User 5", "username": "user5", "email": "user5@example.com"},
//     {"id": 6, "name": "User 6", "username": "user6", "email": "user6@example.com"},
//     {"id": 7, "name": "User 7", "username": "user7", "email": "user7@example.com"},
//     {"id": 8, "name": "User 8", "username": "user8", "email": "user8@example.com"},
//     {"id": 9, "name": "User 9", "username": "user9", "email": "user9@example.com"},
//     {"id": 10, "name": "User 10", "username": "user10", "email": "user10@example.com"}
//   ] as User[];
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
