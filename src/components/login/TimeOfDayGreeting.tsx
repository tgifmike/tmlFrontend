'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface TimeOfDayGreetingProps {
	name?: string;
}

const TimeOfDayGreeting: React.FC<TimeOfDayGreetingProps> = ({ name }) => {
	const [currentHour, setCurrentHour] = useState(new Date().getHours());

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentHour(new Date().getHours());
		}, 60 * 1000); // update every minute
		return () => clearInterval(interval);
	}, []);

	let timeOfDayText = '';
	let emoji = '';

	if (currentHour < 5) {
		timeOfDayText = "It's the middle of the night";
		emoji = '🌙';
	} else if (currentHour < 12) {
		timeOfDayText = 'Good morning';
		emoji = '☀️';
	} else if (currentHour < 17) {
		timeOfDayText = 'Good afternoon';
		emoji = '🌤️';
	} else if (currentHour < 20) {
		timeOfDayText = 'Good evening';
		emoji = '🌇';
	} else {
		timeOfDayText = "It's getting late";
		emoji = '🌙';
	}

	const displayName = name?.split(' ')[0] ?? 'You';

	return (
		<Card className="w-fit border-0 shadow-none bg-transparent">
			<CardContent className="!p-0 flex items-center gap-2">
				<p className="text-2xl md:text-3xl font-semibold">{timeOfDayText}</p>

				<span className="text-2xl md:text-3xl font-semibold text-chart-3 italic">
					{displayName},
				</span>
			</CardContent>
		</Card>
	);
};

export default TimeOfDayGreeting;
