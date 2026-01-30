import React from 'react';
import { GlassCard } from './GlassCard';
import { X, MapPin } from 'lucide-react';
import { FavoriteCity } from '../types/weather';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteCitiesProps {
  favorites: FavoriteCity[];
  onSelect: (city: FavoriteCity) => void;
  onRemove: (cityName: string) => void;
  currentCity?: string;
}

export const FavoriteCities: React.FC<FavoriteCitiesProps> = ({ 
  favorites, 
  onSelect, 
  onRemove,
  currentCity 
}) => {
  if (favorites.length === 0) {
    return (
      <GlassCard className="p-6 col-span-full lg:col-span-4" testId="favorite-cities">
        <h3 className="text-lg font-semibold text-white tracking-tight font-heading mb-4">
          Saved Cities
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-white/50">
          <MapPin className="w-10 h-10 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-center">
            No saved cities yet.<br />
            Click the heart icon to save a city.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 col-span-full lg:col-span-4" testId="favorite-cities">
      <h3 className="text-lg font-semibold text-white tracking-tight font-heading mb-4">
        Saved Cities
      </h3>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {favorites.map((city) => {
            const isActive = currentCity?.toLowerCase() === city.name.toLowerCase();
            
            return (
              <motion.div
                key={city.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl',
                  'bg-white/5 border border-white/10',
                  'hover:bg-white/10 transition-all duration-200 cursor-pointer',
                  isActive && 'bg-white/15 border-white/30'
                )}
                onClick={() => onSelect(city)}
                data-testid={`favorite-${city.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                  <span className="text-white capitalize font-medium">{city.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(city.name);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  data-testid={`remove-favorite-${city.name.toLowerCase()}`}
                  aria-label={`Remove ${city.name} from favorites`}
                >
                  <X className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
