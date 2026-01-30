import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import locations from '../locations.json';
import { LocationData } from '../types/weather';

interface SearchBarProps {
  onSearch: (cityName: string, lat: number, lng: number) => void;
  onLocationRequest: () => void;
  locationLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onLocationRequest,
  locationLoading = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCities = Object.keys(locations);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allCities.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, allCities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityName: string) => {
    const cityData = locations[cityName as keyof typeof locations] as LocationData;
    if (cityData) {
      setQuery(cityName);
      setSuggestions([]);
      setIsFocused(false);
      onSearch(cityName, cityData.enlem, cityData.boylam);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCity = allCities.find(
      city => city.toLowerCase() === query.toLowerCase()
    );
    if (matchedCity) {
      handleSelect(matchedCity);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'flex items-center gap-3',
            'bg-black/20 backdrop-blur-md border border-white/10',
            'rounded-full px-5 py-3',
            'transition-all duration-300',
            isFocused && 'bg-black/30 border-white/30 shadow-lg'
          )}
        >
          <Search className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search city..."
            className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
            data-testid="search-input"
          />
          <button
            type="button"
            onClick={onLocationRequest}
            disabled={locationLoading}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              'hover:bg-white/20 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Use my location"
            data-testid="location-button"
          >
            {locationLoading ? (
              <Loader2 className="w-5 h-5 text-white/80 animate-spin" strokeWidth={1.5} />
            ) : (
              <MapPin className="w-5 h-5 text-white/80" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-black/60 backdrop-blur-xl border border-white/10',
              'rounded-2xl overflow-hidden shadow-xl'
            )}
            data-testid="search-suggestions"
          >
            {suggestions.map((city, index) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className={cn(
                  'w-full px-5 py-3 text-left text-white',
                  'hover:bg-white/10 transition-colors duration-150',
                  'capitalize',
                  index !== suggestions.length - 1 && 'border-b border-white/5'
                )}
                data-testid={`suggestion-${city.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                  <span>{city}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
