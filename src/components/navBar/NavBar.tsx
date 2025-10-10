'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useSession } from 'next-auth/react';
import UserAccountNav from './UserAccountNav';
import { buttonVariants } from '../ui/button';

const NavBar = () => {
	const { data: session } = useSession();

	return (
		<nav className="flex justify-between items-center w-full px-3 sm:px-6 md:px-10 py-2 bg-accent text-chart-3 overflow-x-hidden">
			{/* Left: Logo + Title */}
			<Link href="/" className="flex items-center min-w-0">
				<Image
					src="/newLogo.png"
					alt="Logo"
					width={85}
					height={85}
					className="rounded-full w-10 h-10 sm:w-14 sm:h-14 md:w-[85px] md:h-[85px] flex-shrink-0"
				/>
				<h1 className="hidden sm:block font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl ml-2 truncate">
					<span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
						T
					</span>
					he{' '}
					<span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
						M
					</span>
					anager{' '}
					<span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
						L
					</span>
					ife
				</h1>
			</Link>

			{/* Right: Auth / Avatar */}
			<div className="flex-shrink-0">
				{session?.user ? (
					<UserAccountNav user={session.user} />
				) : (
					<Link
						href="/login"
						className={buttonVariants({
							variant: 'outline',
							className: 'font-bold',
						})}
					>
						Sign In
					</Link>
				)}
			</div>
		</nav>
	);
};

export default NavBar;
