import React from 'react';
import { GlassCard } from './GlassCard';
import { HourlyData } from '../types/weather';
import { prepareChartData } from '../utils/weatherUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeatherChartProps {
  data: HourlyData;
  limit?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-semibold">{payload[0].value}°C</p>
        <p className="text-white/60 text-sm">{payload[0].payload.hour}</p>
      </div>
    );
  }
  return null;
};

export const WeatherChart: React.FC<WeatherChartProps> = ({ data, limit = 24 }) => {
  const chartData = prepareChartData(data.time, data.temperature2m, limit);

  return (
    <GlassCard className="p-6 col-span-full lg:col-span-8" testId="weather-chart">
      <h3 className="text-lg font-semibold text-white tracking-tight font-heading mb-4">
        Temperature Trend
      </h3>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#temperatureGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#ffffff', stroke: 'rgba(255,255,255,0.3)', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
