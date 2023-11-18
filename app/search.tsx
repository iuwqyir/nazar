'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function Search({ disabled }: { disabled?: boolean }) {
  const router = useRouter(); // Use the router
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  function handleSearch(term: string) {
    setSearchTerm(term);
    setShowDropdown(term.length > 0);
  }

  function handleDropdownItemClick(item: string) {
    // http://localhost:3001/account-abstraction/chain/hash
    router.push(`/account-abstraction/ethereum/${item}`); // Navigate to the path
  }

  return (
    <div className="relative mt-5 max-w-xl mx-auto">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="flex items-center rounded-full border border-gray-300 hover:shadow-lg">
        <div
          className="pointer-events-none absolute ml-4 inset-y-0 left-0 flex items-center"
          aria-hidden="true"
        >
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-500"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          disabled={disabled}
          className="h-10 block w-full pl-10 pr-4 rounded-full focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Search..."
          spellCheck={false}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isPending && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
          {/* Loading spinner */}
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full rounded-md shadow-lg bg-white z-50">
          <ul>
            {[
              '0xc4380f288cec0c9647daf6908b0034ae5dae7eec7a5233dbeadf4c019d7c140f',
              '0xc4380f288cec0c9647daf6908b0034ae5dae7eec7a5233dbeadf4c019d7c140f',
              '0xc4380f288cec0c9647daf6908b0034ae5dae7eec7a5233dbeadf4c019d7c140f'
            ].map((item, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleDropdownItemClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
