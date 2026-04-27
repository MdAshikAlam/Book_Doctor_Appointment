"use client";

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, location);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isDisabled = !query.trim() && !location.trim();

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-full shadow-xl border border-gray-100 p-2 flex flex-col md:flex-row items-center gap-2">
      <div className="flex-grow flex items-center px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100">
        <Search className="w-5 h-5 text-primary mr-3" />
        <input 
          type="text" 
          placeholder="Specialty, Doctor, Clinic..." 
          className="bg-transparent border-none focus:ring-0 outline-none w-full text-gray-700 placeholder-gray-400 font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="flex-grow flex items-center px-4 py-2 w-full">
        <MapPin className="w-5 h-5 text-primary mr-3" />
        <input 
          type="text" 
          placeholder="Location (District, State)" 
          className="bg-transparent border-none focus:ring-0 outline-none w-full text-gray-700 placeholder-gray-400 font-medium"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <button 
        onClick={handleSearch}
        disabled={isDisabled}
        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl md:rounded-full font-bold transition-all shadow-lg hover:shadow-primary/25 whitespace-nowrap disabled:bg-gray-400 disabled:shadow-none"
      >
        Find Doctors
      </button>
    </div>
  );
};

export default SearchBar;
