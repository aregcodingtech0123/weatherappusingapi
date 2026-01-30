import { useState, useEffect, useCallback } from 'react';
import { FavoriteCity } from '../types/weather';

const STORAGE_KEY = 'weather-favorites';

interface UseFavoritesReturn {
  favorites: FavoriteCity[];
  addFavorite: (city: FavoriteCity) => void;
  removeFavorite: (cityName: string) => void;
  isFavorite: (cityName: string) => boolean;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((city: FavoriteCity) => {
    setFavorites(prev => {
      // Check if already exists
      if (prev.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
        return prev;
      }
      return [...prev, city];
    });
  }, []);

  const removeFavorite = useCallback((cityName: string) => {
    setFavorites(prev => 
      prev.filter(c => c.name.toLowerCase() !== cityName.toLowerCase())
    );
  }, []);

  const isFavorite = useCallback((cityName: string) => {
    return favorites.some(c => c.name.toLowerCase() === cityName.toLowerCase());
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
