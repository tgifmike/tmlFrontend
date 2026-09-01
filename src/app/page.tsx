
import HomeClient from '@/components/homePage/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Digital Line Check App for Restaurants',
	description:
		'Run digital restaurant line checks from any phone or tablet, even offline. Replace paper checklists, improve inspection readiness, and keep every kitchen shift consistent.',
};

export default function Page() {
	return <HomeClient />;
}
