"use client";

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const isDisabled = !query.trim() && !location.trim();

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-full shadow-xl border border-gray-100 p-2 flex flex-col md:flex-row items-center gap-2">
      <div className="flex-grow flex items-center px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100">
        <Search className="w-5 h-5 text-primary mr-3" />
        <input 
          type="text" 
          placeholder="Specialty, Doctor name..." 
          className="bg-transparent border-none focus:ring-0 outline-none w-full text-gray-700 placeholder-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex-grow flex items-center px-4 py-2 w-full">
        <MapPin className="w-5 h-5 text-primary mr-3" />
        <input 
          type="text" 
          placeholder="Location (City, Zip)" 
          className="bg-transparent border-none focus:ring-0 outline-none w-full text-gray-700 placeholder-gray-400"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <button 
        disabled={isDisabled}
        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl md:rounded-full font-bold transition-all shadow-lg hover:shadow-primary/25 whitespace-nowrap disabled:bg-gray-400 disabled:shadow-none"
      >
        Find Doctors
      </button>
    </div>
  );
};

export default SearchBar;
