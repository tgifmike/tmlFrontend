'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import UserAvatar from './UserAvatar';
import { useSession } from 'next-auth/react';
import UserAccountNav from './UserAccountNav';

const NavBar = () => {
    const { data: session, status } = useSession();
  return (
		<nav className="flex justify-between items-center p-4 text-chart-3 bg-accent">
			<div>
				<Link href="/" className="flex items-center">
					<Image
						src="/newLogo.png"
						alt="Logo"
						width={85}
						height={85}
						className="rounded-full"
					/>
					<h1 className="text-4xl md:text-5xl font-bold italic">
						<span className="text-5xl md:text-6xl">T</span>he{' '}
						<span className="text-5xl md:text-6xl">M</span>anager{' '}
						<span className="text-5xl md:text-6xl">L</span>ife
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
						<Link href="/login">login</Link>
					</div>
				)}
			</div>
		</nav>
	);
}

export default NavBar