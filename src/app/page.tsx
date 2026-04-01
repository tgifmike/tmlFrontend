
import HomeClient from '@/components/homePage/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Restaurant Line Check App for iPad Kitchens',
	description:
		'Build stations, assign food safety checks, and run digital restaurant line checks from iPad. Improve health inspection readiness and kitchen execution across locations.',
};

export default function Page() {
	return <HomeClient />;
}
