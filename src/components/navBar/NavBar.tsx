'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useMemo } from 'react';

import UserAccountNav from './UserAccountNav';
import { buttonVariants } from '../ui/button';
import SectionNav from './SectionNav';
import MobileDrawerNav from './MoibileDrawerNav';
import LandingSectionLinks from './LandingSectionLinks';
import { useSession } from '@/lib/auth/session-context';

const NavBar = () => {
	const { user, loading } = useSession();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const showPublicNavigation = !loading && !user;

	// stable scroll handler (no re-creation per render)
	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		if (user) setDrawerOpen(false);
	}, [user]);

	// prevent re-render churn from session state changes
	const rightContent = useMemo(() => {
		if (loading) return null;

		if (user) {
			return <UserAccountNav user={user} />;
		}

		return (
			<Link
				href="/login"
				className={buttonVariants({
					variant: 'outline',
					className: 'font-bold transition-transform hover:scale-[1.03]',
				})}
			>
				Sign In
			</Link>
		);
	}, [user, loading]);

	return (
		<header
			className="
				fixed top-0 left-0 right-0 z-50
				border-b backdrop-blur-xl
				bg-accent/80
				transition-colors duration-300
			"
		>
			<nav
				className="
					grid grid-cols-[1fr_auto_1fr] items-center
					px-4 sm:px-6 md:px-10
					h-20
				"
			>
				{/* ================= LEFT ================= */}
				<div className="flex items-center gap-3">
					<Link
						href="/"
						className={`block rounded-lg transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
							scrolled ? 'scale-95' : 'scale-100'
						}`}
						aria-label="The Manager Life home"
					>
						<Image
							src="/newLogo.png"
							alt="The Manager Life"
							width={160}
							height={80}
							priority
							className="h-14 w-24 object-contain object-center sm:h-16 sm:w-28"
						/>
					</Link>
				</div>

				{/* ================= CENTER ================= */}
				<div className="flex justify-center">
					{showPublicNavigation && (
						<>
							<div className="hidden md:flex">
								<SectionNav />
							</div>

							<div className="md:hidden">
								<MobileDrawerNav
									open={drawerOpen}
									setOpen={setDrawerOpen}
									title="Menu"
								>
									<LandingSectionLinks
										onNavigate={() => setDrawerOpen(false)}
									/>
								</MobileDrawerNav>
							</div>
						</>
					)}
				</div>

				{/* ================= RIGHT ================= */}
				<div className="flex justify-end items-center">{rightContent}</div>
			</nav>
		</header>
	);
};

export default NavBar;
