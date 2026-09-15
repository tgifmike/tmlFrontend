
import HomeClient from '@/components/homePage/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Digital Restaurant Line Check Software',
	description:
		'Run digital restaurant line checks from an iPad or iPhone, even offline. Track food temperatures, replace paper checklists, and keep every kitchen shift inspection-ready.',
};

export default function Page() {
	return <HomeClient />;
}
