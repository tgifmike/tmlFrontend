'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import UserAvatar from './UserAvatar';
import { useSession } from 'next-auth/react';
import UserAccountNav from './UserAccountNav';
import { buttonVariants } from '../ui/button';

const NavBar = () => {
    const { data: session, status } = useSession();
  return (
		<nav className="flex justify-between items-center p-1 md:p-4 text-chart-3 bg-accent">
			<div>
				<Link href="/" className="flex items-center">
					<Image
						src="/newLogo.png"
						alt="Logo"
						width={85}
						height={85}
						className="rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-[85px] md:h-[85px]"
					/>
					<h1 className="hidden sm:block font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
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
			</div>
			<div>
				{session?.user ? (
					<div>
						<UserAccountNav user={session.user} />
					</div>
				) : (
					<div>
						<Link
							href="/login"
							className={buttonVariants({
								variant: 'outline',
								className: 'font-bold',
							})}
						>
							Sign In
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
}

export default NavBar