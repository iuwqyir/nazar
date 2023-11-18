'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Loader from './components/loader';

export default function Search({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [dropdownFetched, setDropdownFetched] = useState(false);
  const [contractsList, setContractsList] = useState([])

  function handleSearch(term: string) {
    setSearchTerm(term);
    setShowDropdown(term.length > 0);
  }

  useEffect(() => {
    if (searchTerm.length > 10 && !dropdownFetched) {
      setShowLoading(true);
      getDropDownElements().then((response) => {

          setDropdownFetched(true); // Indicate that dropdown elements have been fetched
      })
    }

    if (searchTerm.length <= 10 || contractsList.length === 0) {
      setDropdownFetched(false); // Reset when searchTerm is less than or equal to 10
    }
  }, [searchTerm]);

  function renderDropdownElements() {
    return contractsList.map((item: any, index: any) => (
        <li
          key={index}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleDropdownItemClick(item.hash, item.chain.name)}
        >
          {item.hash}
        </li>
      ));
  }

  function getDropDownElements() {
    return fetch(`/api/search/${searchTerm}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((result) => {
      result.json().then((contractsList) => {
        setShowLoading(false)
        if (contractsList?.data) setContractsList(contractsList.data)
      });
    }).catch(error => {
        console.error('Error:', error);
      });
  }

  function handleDropdownItemClick(hash: string, chain: string) {
    // http://localhost:3001/account-abstraction/chain/hash
    router.push(`/account-abstraction/${chain}/${hash}`); // Navigate to the path
  }

  return (
    <div className="relative mt-5 max-w-prose mx-auto">
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
            <Loader />
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full rounded-md shadow-lg bg-white z-50">
          <ul>{renderDropdownElements()}</ul>
        </div>
      )}
    </div>
  );
}

