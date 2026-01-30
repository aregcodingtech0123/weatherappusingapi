import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherComponent } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherChart } from './components/WeatherChart';
import { FavoriteCities } from './components/FavoriteCities';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useFavorites } from './hooks/useFavorites';
import { FavoriteCity, WeatherCondition } from './types/weather';
import { getWeatherCondition, weatherThemes, isNightTime } from './utils/weatherUtils';
import { cn } from './utils/cn';
import { Cloud, CloudSun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

function App() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const { weatherData, loading, error, refetch } = useWeather(latitude, longitude);
  const geolocation = useGeolocation();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Get weather condition for dynamic background
  const getCondition = useCallback((): WeatherCondition => {
    if (weatherData?.current) {
      return getWeatherCondition(weatherData.current.weatherCode, isNightTime());
    }
    return isNightTime() ? 'night' : 'sunny';
  }, [weatherData?.current]);

  const theme = weatherThemes[getCondition()];

  // Handle city search
  const handleSearch = useCallback((cityName: string, lat: number, lng: number) => {
    setSelectedCity(cityName);
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  // Handle geolocation
  const handleLocationRequest = useCallback(() => {
    geolocation.getCurrentLocation();
  }, [geolocation]);

  // Update coordinates when geolocation changes
  useEffect(() => {
    if (geolocation.latitude && geolocation.longitude) {
      setLatitude(geolocation.latitude);
      setLongitude(geolocation.longitude);
      setSelectedCity('My Location');
    }
  }, [geolocation.latitude, geolocation.longitude]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(() => {
    if (selectedCity && latitude && longitude) {
      if (isFavorite(selectedCity)) {
        removeFavorite(selectedCity);
      } else {
        addFavorite({ name: selectedCity, latitude, longitude });
      }
    }
  }, [selectedCity, latitude, longitude, isFavorite, addFavorite, removeFavorite]);

  // Handle favorite city selection
  const handleFavoriteSelect = useCallback((city: FavoriteCity) => {
    setSelectedCity(city.name);
    setLatitude(city.latitude);
    setLongitude(city.longitude);
  }, []);

  const hasData = weatherData && selectedCity;
  const isLoading = loading || geolocation.loading;

  return (
    <div 
      className={cn(
        'min-h-screen transition-all duration-700 ease-in-out',
        theme.background,
        theme.textColor
      )}
      data-testid="weather-app"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-12">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <CloudSun className="w-10 h-10 text-white" strokeWidth={1.5} />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">
                Weather Dashboard
              </h1>
            </div>
            <SearchBar
              onSearch={handleSearch}
              onLocationRequest={handleLocationRequest}
              locationLoading={geolocation.loading}
            />
          </div>
        </motion.header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!hasData && !isLoading && !error && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Cloud className="w-24 h-24 text-white/30 mb-6" strokeWidth={1} />
              <h2 className="text-2xl md:text-3xl font-semibold text-white/80 mb-3 text-center font-heading">
                Welcome to Weather Dashboard
              </h2>
              <p className="text-white/60 text-center max-w-md">
                Search for a city or use your current location to get started with detailed weather forecasts.
              </p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorMessage message={error} onRetry={refetch} />
            </motion.div>
          )}

          {geolocation.error && (
            <motion.div
              key="geo-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorMessage message={geolocation.error} />
            </motion.div>
          )}

          {hasData && !isLoading && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Current Weather */}
              {weatherData.current && (
                <CurrentWeatherComponent
                  data={weatherData.current}
                  cityName={selectedCity}
                  isFavorite={isFavorite(selectedCity)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Favorite Cities */}
              <FavoriteCities
                favorites={favorites}
                onSelect={handleFavoriteSelect}
                onRemove={removeFavorite}
                currentCity={selectedCity}
              />

              {/* Hourly Forecast */}
              {weatherData.hourly && (
                <HourlyForecast data={weatherData.hourly} limit={24} />
              )}

              {/* Weather Chart */}
              {weatherData.hourly && (
                <WeatherChart data={weatherData.hourly} limit={24} />
              )}

              {/* Daily Forecast */}
              {weatherData.daily && (
                <DailyForecast data={weatherData.daily} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-white/40 text-sm"
        >
          <p>Powered by Open-Meteo API • Built with React & Tailwind CSS</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
