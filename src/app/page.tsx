
import Hero from '@/components/homePage/Hero';
import Why from '@/components/homePage/Why';
import { ModeToggle } from '@/components/theme/ModeToggle';
import Link from 'next/link';
import Does from '@/components/homePage/Does';
import Head from 'next/head';
import Headlines from '@/components/homePage/Headlines';

export default function Home() {
	
	return (
		<div className='w-full mx-auto max-w-7xl'>
			<div>
				{/* <h1 className="text-4xl p-4">Welcome to the Manager Life!</h1> */}
				<Hero />
				<Why />
				<Does />
				<Headlines />
			</div>

			
		</div>
	);
}
