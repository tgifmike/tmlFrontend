'use client';

import { useEffect, useState } from 'react';

interface TimeOfDayGreetingProps {
	name?: string | null;
}

const getGreeting = (hour: number | null) => {
	if (hour === null) return 'Welcome';
	if (hour === 0) return "It's midnight";
	if (hour < 3) return "It's the middle of the night";
	if (hour < 5) return "Wow, it's early";
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	if (hour < 22) return 'Good evening';
	return "It's getting late";
};

export default function TimeOfDayGreeting({
	name,
}: TimeOfDayGreetingProps) {
	// Starting with null keeps the server and first browser render identical.
	const [currentHour, setCurrentHour] = useState<number | null>(null);

	useEffect(() => {
		const updateHour = () => setCurrentHour(new Date().getHours());

		updateHour();
		const interval = window.setInterval(updateHour, 60 * 1000);

		return () => window.clearInterval(interval);
	}, []);

	const firstName = name?.trim().split(/\s+/)[0] || 'there';

	return (
		<p
			className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold md:text-3xl"
			aria-live="polite"
		>
			<span>{getGreeting(currentHour)},</span>
			<span className="italic text-chart-3">{firstName}</span>
		</p>
	);
}
