'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ReactAnimatedWeather from 'react-animated-weather';
import Image from 'next/image';

interface WeatherWidgetProps {
	lat: number;
	lon: number;
	fetchWeather: (lat: number, lon: number) => Promise<any>;
}

const iconMapping: Record<string, string> = {
	clear: 'CLEAR_DAY',
	sunny: 'CLEAR_DAY',
	'partly cloudy': 'PARTLY_CLOUDY_DAY',
	'mostly cloudy': 'CLOUDY',
	cloudy: 'CLOUDY',
	rain: 'RAIN',
	showers: 'RAIN',
	snow: 'SNOW',
	sleet: 'SLEET',
	storm: 'WIND',
	thunder: 'WIND',
	fog: 'FOG',
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
	lat,
	lon,
	fetchWeather,
}) => {
	const [weather, setWeather] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadWeather = async () => {
			try {
				setLoading(true);
				const data = await fetchWeather(lat, lon);
				setWeather(data);
			} catch (err) {
				console.error('Failed to load weather:', err);
			} finally {
				setLoading(false);
			}
		};

		loadWeather();
		const interval = setInterval(loadWeather, 30 * 60 * 1000); // refresh every 30 min
		return () => clearInterval(interval);
	}, [lat, lon, fetchWeather]);

	if (loading)
		return (
			<div className="p-4 text-center text-muted-foreground">
				Loading weather data…
			</div>
		);
	if (!weather)
		return (
			<div className="p-4 text-center text-muted-foreground">
				No weather data available.
			</div>
		);

	const current = weather?.data?.forecast?.properties?.periods?.[0];
	const hourly = weather?.data?.hourly?.properties?.periods || [];
	const alerts = weather?.data?.alerts?.features || [];

	const getAnimatedIcon = (forecast: string) => {
		const key = Object.keys(iconMapping).find((k) =>
			forecast.toLowerCase().includes(k)
		);
		return key ? iconMapping[key] : 'CLEAR_DAY';
	};

	const getGradient = () => {
		if (!current) return 'bg-gradient-to-br from-gray-300 to-gray-100';
		const condition = current.shortForecast.toLowerCase();
		const temp = current.temperature;

		if (condition.includes('rain') || condition.includes('showers'))
			return 'bg-gradient-to-br from-blue-500 to-blue-300';
		if (condition.includes('cloud'))
			return 'bg-gradient-to-br from-gray-400 to-gray-200';
		if (condition.includes('snow'))
			return 'bg-gradient-to-br from-white to-blue-100';
		if (condition.includes('storm') || condition.includes('thunder'))
			return 'bg-gradient-to-br from-gray-700 to-gray-500';
		if (temp >= 85) return 'bg-gradient-to-br from-yellow-400 to-orange-500';
		if (temp >= 70) return 'bg-gradient-to-br from-yellow-200 to-green-300';
		if (temp >= 50) return 'bg-gradient-to-br from-green-200 to-blue-200';
		return 'bg-gradient-to-br from-gray-300 to-gray-100';
	};

	return (
		<Card className={`w-full space-y-4 ${getGradient()}`}>
			{/* Current Weather */}{' '}
			<CardHeader>
				{' '}
				<CardTitle className='text-2xl text-chart-3 font-bold'>Current Weather</CardTitle>{' '}
			</CardHeader>{' '}
			<CardContent className="flex items-center gap-6">
				{current && (
					<>
						{' '}
						{/* <ReactAnimatedWeather
							icon={getAnimatedIcon(current.shortForecast)}
							color="#000"
							size={64}
							animate={true}
                        />{' '} */}
						<div>
							<Image
								src={hourly[0].icon}
								alt="image of weather conditions"
								height={200}
								width={200}
								className="rounded-xl"
							/>
						</div>
						<div className="flex-1 space-y-1">
							{' '}
							<p className="text-xl font-semibold">
								{current.shortForecast}
							</p>{' '}
							<p className="text-4xl font-bold">
								{hourly[0].temperature}°{current.temperatureUnit}{' '}
							</p>{' '}
							<p className="text-sm">
								High: {current.temperature}°{current.temperatureUnit}{' '}
							</p>{' '}
							<p className="text-sm">
								Wind: {current.windSpeed} from the {current.windDirection}{' '}
							</p>{' '}
							<p className="text-sm">
								Chance of Precipitation:{' '}
								{current.probabilityOfPrecipitation.value}%{' '}
							</p>{' '}
							<p className="text-sm">
								Relative Humidity: {hourly[0].relativeHumidity.value}%{' '}
							</p>{' '}
						</div>
					</>
				)}{' '}
			</CardContent>
			{/* Hourly Forecast */}
			{hourly.length > 0 && (
				<div>
					<CardHeader>
						<CardTitle className='text-xl'>Hourly Forecast</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="w-full">
							<div className="flex gap-4 pb-2">
								{hourly.slice(0, 12).map((hour: any) => (
									<div
										key={hour.number}
                                        // className="flex-shrink-0 w-20 text-center align-middle"
                                        className='flex flex-col gap-3 w-10 text-center '
									>
										<div>
											<p className="text-xs font-medium">
												{new Date(hour.startTime).toLocaleTimeString('en-US', {
													hour: 'numeric',
													minute: undefined, // you can also use "2-digit" if you want minutes
													hour12: true,
												})}
											</p>
										</div>
										<div>
											<ReactAnimatedWeather
												icon={getAnimatedIcon(hour.shortForecast)}
												color="#000"
												size={40}
												animate={true}
											/>
										</div>
										<div>
											<p className="text-sm font-semibold">
												{hour.temperature}°{hour.temperatureUnit}
											</p>
										</div>

										
									</div>
								))}
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</CardContent>
				</div>
			)}
			{/* Alerts */}
			{alerts.length > 0 && (
				<div>
					<CardHeader>
						<CardTitle className="text-destructive text-xl">Active Alerts</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="max-h-48">
							<div className="flex flex-col gap-1">
								{alerts.map((alert: any) => (
                                    <Badge key={alert.id}
                                        className='text-lg'
                                        variant="destructive">
										{alert.properties.headline || 'Weather Alert'}
									</Badge>
								))}
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</CardContent>
				</div>
			)}
		</Card>
	);
};

export default WeatherWidget;
