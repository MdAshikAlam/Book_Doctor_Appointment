'use client';

import { useState } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';

export default function HeaderSearch() {
  const [city] = useState('Select City');
  const [query, setQuery] = useState('');

  return (
    <div className="hidden md:flex items-center bg-gray-100/80 rounded-full px-3 py-1.5 border border-transparent focus-within:bg-white focus-within:border-primary/20 transition-all duration-200 w-full max-w-sm lg:max-w-md">
      {/* City Selector */}
      <div className="flex items-center space-x-1 px-2 cursor-pointer group whitespace-nowrap border-r border-gray-300">
        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        <span className="text-xs font-semibold text-gray-600 group-hover:text-primary transition-colors pr-1">
          {city}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </div>

      {/* Main Search Input */}
      <div className="flex items-center flex-grow pl-3 relative">
        <input
          type="text"
          placeholder="Search doctors, clinics, etc"
          className="bg-transparent border-none focus:ring-0 outline-none w-full text-xs text-gray-700 placeholder-gray-400 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          disabled={!query.trim()}
          className="flex items-center justify-center p-1.5 text-gray-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
