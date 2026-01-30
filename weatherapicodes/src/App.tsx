import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchWeatherApi } from 'openmeteo';
import locations from "./locations.json";

interface LocationData {
  enlem: number;
  boylam: number;
}

function App() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false); // Başlangıçta false
  const [selectedCityName, setCityName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null); // Başlangıçta null
  const [longitude, setLongitude] = useState<number | null>(null); // Başlangıçta null
  const [cityFoundState, setCityFoundState] = useState(false);

  const openCageAPIKEY = "4d9b644d6b90410388459c16bfdc94b3";
  const allCities = Object.keys(locations).map(city => city.toLowerCase());

  const checkCity = (cityName: string) => {
    const lowCaseCityName = cityName.toLocaleLowerCase();
    const isCityInList = allCities.includes(lowCaseCityName);
    setCityFoundState(isCityInList);

    if (isCityInList) {
      const cityData = locations[lowCaseCityName as keyof typeof locations] as LocationData; // locations tipine uygun
      setLatitude(cityData.enlem);
      setLongitude(cityData.boylam);
    } else {
      setLatitude(null); // Şehir bulunamazsa null yap
      setLongitude(null);
      setWeatherData(null); // Önceki veriyi temizle
    }
    setLoading(true); // Hava durumu çekme başlatılacağı için true
  };

  const handleBtnClick = () => {
    checkCity(selectedCityName);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCityName(event.target.value);
  };

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  useEffect(() => {
    const getResponse = async () => {
      if (latitude !== null && longitude !== null) { // Sadece lat ve long varsa istek at
        const url = "https://api.open-meteo.com/v1/forecast";
        const params = {
          latitude: latitude,
          longitude: longitude,
          hourly: "temperature_2m",
        };

        try {
          const responses = await fetchWeatherApi(url, params);
          const response = responses[0];

          const utcOffsetSeconds = response.utcOffsetSeconds();
          const hourly = response.hourly()!;

          const weatherData = {
            hourly: {
              time: range(Number(hourly?.time()), Number(hourly?.timeEnd()), hourly.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
              ),
              temperature2m: hourly.variables(0)!.valuesArray()!,
            },
          };

          setWeatherData(weatherData);
        } catch (error) {
          console.error("Hava durumu verisi çekilirken hata oluştu:", error);
          setWeatherData(null); // Hata durumunda veriyi temizle
        } finally {
          setLoading(false);
        }
      }
    };
    getResponse();
  }, [latitude, longitude]); // latitude ve longitude değiştiğinde çalış

  return (
    <div className="container">
      <div>
        <label htmlFor="cityInput">City:</label>
        <input
          type="text"
          id="cityInput"
          placeholder="Type city name"
          onChange={handleInputChange}
          value={selectedCityName}
        />
        <button onClick={handleBtnClick}>Get Details</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : cityFoundState ? (
        weatherData ? ( // weatherData'nın varlığını kontrol et
          <div>
            <h1 className='text-center'>Weather in {selectedCityName} for every hour</h1>
            {weatherData.hourly.time.map((time: Date, i: number) => (
              <div key={i} className='m-3'>
                <h2>Date-Time: {time.toLocaleDateString()} {time.toLocaleTimeString()}</h2>
                <h2>Temperature: {Math.round(weatherData.hourly.temperature2m[i])} °C</h2>
              </div>
            ))}
          </div>
        ) : (
          <p>Hava durumu verisi alınamadı.</p> // Hata mesajı
        )
      ) : (
        <p>{selectedCityName ? `City "${selectedCityName}" not found` : "Please enter a city name"}</p>
      )}
    </div>
  );
}

export default App;
