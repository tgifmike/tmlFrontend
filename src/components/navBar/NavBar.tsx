'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import UserAccountNav from './UserAccountNav';
import { buttonVariants } from '../ui/button';
import SectionNav from './SectionNav';
import MobileDrawerNav from './MoibileDrawerNav';
import LandingSectionLinks from './LandingSectionLinks';
import { useSession } from '@/lib/auth/session-context';


const NavBar = () => {
	const { user, loading, logout } = useSession();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener('scroll', onScroll);
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
				scrolled ? 'bg-accent/70 shadow-sm' : 'bg-accent'
			}`}
		>
			<nav
				className={`grid grid-cols-3 items-center px-4 sm:px-6 md:px-10 transition-all duration-300 ${
					scrolled ? 'h-14' : 'h-24'
				}`}
			>
				{/* ================= LEFT ================= */}
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/newLogo.png"
							alt="Logo"
							width={scrolled ? 34 : 40}
							height={scrolled ? 34 : 40}
							className="rounded-full transition-all duration-300"
						/>

						<span
							className={`font-bold transition-all duration-300 ${
								scrolled ? 'text-lg' : 'text-xl'
							}`}
						>
							The Manager Life
						</span>
					</Link>
				</div>

				{/* ================= CENTER (ALWAYS VISIBLE) ================= */}
				<div className="flex justify-center">
					<div className="transition-all duration-300 scale-100">
						<div className="hidden md:flex">
							<SectionNav />
						</div>

						<div className="md:hidden">
							<MobileDrawerNav
								open={drawerOpen}
								setOpen={setDrawerOpen}
								title="Menu"
							>
								<LandingSectionLinks onNavigate={() => setDrawerOpen(false)} />
							</MobileDrawerNav>
						</div>
					</div>
				</div>

				{/* ================= RIGHT ================= */}
				<div className="flex justify-end">
					<div className="transition-all duration-300">
						{ user ? (
							<UserAccountNav user={user} />
						) : (
							<Link
								href="/login"
								className={buttonVariants({
									variant: 'outline',
									className: 'font-bold transition-all hover:scale-[1.03]',
								})}
							>
								Sign In
							</Link>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
};

export default NavBar;
