import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search' }) => {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-12 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
      />
    </div>
  );
};

export default SearchBar;
