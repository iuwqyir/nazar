'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

export default function Search({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  function handleSearch(term: string) {
    setSearchTerm(term);
    setShowDropdown(term.length > 0);
  }

  useEffect(() => {
    if (searchTerm.length > 10) {
        setShowDropdown(true)
        setShowLoading(true)
    } 
  }, [searchTerm]);

  function getDropDownElements() {
    fetch(`/api/search/${searchTerm}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((result) => {
      result.json().then((contractsList) => {
        setShowLoading(false)
        return contractsList.map((item, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleDropdownItemClick(item.hash)}
          >
            {item.hash}
          </li>
        ));
      });
    }).catch(error => {
        console.error('Error:', error);
      });
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

      {showLoading && (
          <div className="absolute w-full top-full mt-2">
          <div className="absolute top-full mt-2 w-full rounded-md shadow-lg bg-white z-50">
            <div className="flex items-center justify-center p-2">
              <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-500 rounded-full" />
              <span className="ml-2 text-zinc-900 dark:text-zinc-300">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full rounded-md shadow-lg bg-white z-50">
          <ul>{getDropDownElements()}</ul>
        </div>
      )}
    </div>
  );
}

