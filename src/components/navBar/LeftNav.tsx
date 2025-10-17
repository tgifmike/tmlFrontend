'use client';

import { Icons } from '@/lib/icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type LeftNavProps = {
	accountName: string | null;
	accountImage: string | null;
};

const LeftNav = ({ accountName, accountImage }: LeftNavProps) => {
	//icons
    const AddImageIcon = Icons.addPicture;
    const AccountsIcon = Icons.account

    const pathname = usePathname();

	return (
		<nav className="border-r-2 bg-ring h-full">
			<div className="flex justify-center mt-6">
				<p className="text-2xl text-chart-3 font-bold text-center">{accountName}</p>
			</div>
			<div>
				{accountImage ? (
					<Image
						src={accountImage}
						alt="logo"
						className="mx-auto mt-4 rounded-full"
						width={180}
						height={180}
						style={{ maxWidth: '100%', height: 'auto' }}
					/>
				) : (
					<div className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
						<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 px-4 pb-6 mt-6">
				<NavLink
					href="/accounts"
					label="Accounts"
					icon= {<AccountsIcon />}
					pathname={pathname}
				/>
			</div>
		</nav>
	);
};

type NavLinkProps = {
	href: string;
	icon: React.ReactNode;
	label: string;
	pathname: string;
};

const NavLink = ({ href, icon, label, pathname }: NavLinkProps) => {
	const normalizedPath = decodeURIComponent(pathname).toLowerCase();
	const normalizedHref = decodeURIComponent(href).toLowerCase();
	const isActive = normalizedPath === normalizedHref;
    

	return (
		<Link
			href={href}
			className={`flex items-center gap-3 font-bold text-sm md:text-xl hover:underline transition-colors ${
				isActive ? 'text-chart-3' : 'text-background'
			}`}
		>
			<span className="text-xl">{icon}</span>
			<span className="capitalize">{label}</span>
		</Link>
	);
};

export default LeftNav;