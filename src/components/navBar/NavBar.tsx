'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import UserAccountNav from './UserAccountNav';
import { buttonVariants } from '../ui/button';
import SectionNav from './SectionNav';
import MobileDrawerNav from './MoibileDrawerNav';
import LandingSectionLinks from './LandingSectionLinks';
import { useSession } from '@/lib/auth/useSession';

const NavBar = () => {
	const { user, status } = useSession();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', onScroll);
		onScroll();

		

		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? 'backdrop-blur-xl bg-accent/70 border-b shadow-sm'
					: 'bg-accent'
			}`}
		>
			<nav
				className={`grid grid-cols-3 items-center w-full px-3 sm:px-6 md:px-10 transition-all duration-300 ${
					scrolled ? 'h-14' : 'h-20'
				}`}
			>
				{/* Left: Logo + Title */}
				<div className="flex items-center">
					<Link href="/" className="flex items-center">
						<Image
							src="/newLogo.png"
							alt="Logo"
							width={85}
							height={85}
							className={`rounded-full transition-all duration-300 ${
								scrolled ? 'w-9 h-9' : 'w-12 h-12 sm:w-14 sm:h-14'
							}`}
						/>

						<h1 className="hidden sm:block font-bold italic text-xl md:text-3xl ml-2 truncate">
							The Manager Life
						</h1>
					</Link>
				</div>

				{/* stickly nav */}
				<div className="flex justify-center gap-4">
					{/* Desktop nav */}
					<SectionNav />

					{/* Mobile nav */}
					<MobileDrawerNav
						open={drawerOpen}
						setOpen={setDrawerOpen}
						title="Menu"
					>
						<LandingSectionLinks onNavigate={() => setDrawerOpen(false)} />
					</MobileDrawerNav>
				</div>

				{/* Right: Auth / Avatar */}
				<div className="flex justify-end items-center gap-3 min-w-0">
					{status === 'authenticated' && user ? (
						<div className="max-w-[160px] truncate">
							<UserAccountNav user={user} />
						</div>
					) : (
						<Link
							href="/login"
							className={buttonVariants({
								variant: 'outline',
								className: 'font-bold whitespace-nowrap',
							})}
						>
							Sign In
						</Link>
					)}
				</div>
			</nav>
		</header>
	);
};

export default NavBar;
