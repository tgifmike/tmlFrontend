'use client';

import { Icons } from '@/lib/icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UploadAccountImagePopover from './UploadAccountImagePopover';
import { getAccountById, getAccountsForUser } from '@/app/api/accountApi';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type LeftNavProps = {
	accountName: string | null;
    accountImage: string | null;
    imageBase64?: string | null;
	accountId: string;
	locationId: string;
    sessionUserRole: string | undefined;    
};

const LocationNav = ({ accountName, accountImage, accountId, sessionUserRole, locationId }: LeftNavProps) => {

	
	//icons
	const AddImageIcon = Icons.addPicture;
	const AccountsIcon = Icons.account;
	const LocationsIcon = Icons.locations;
	const DashboardIcon = Icons.dashboard;
	const SettingsIcon = Icons.settings;
	const ClipboardIcon = Icons.Clipboard;
	const WeatherIcon = Icons.sun;

	//set stae
	const [image, setImage] = useState<string | null>(null);

	const pathname = usePathname();

	return (
		<nav className="sticky left-0 top-[104px] bg-ring h-[calc(100vh-104px)] overflow-y-auto">
			<div className="flex justify-center mt-6">
				<p className="text-sm md:text-2xl text-chart-3 font-bold text-center">
					{accountName}
				</p>
			</div>
			<div>
				{image || accountImage ? (
					<div className="relative mx-auto mt-4 w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden">
						<Image
							src={`data:image/png;base64,${image ?? accountImage}`}
							alt="Account Logo"
							fill
							className="object-cover rounded-full"
						/>
					</div>
				) : (
					<div className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
						<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-22 lg:w-22" />
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 px-4 pb-6 mt-6">
				<NavLink
					href="/accounts"
					label="Accounts"
					icon={<AccountsIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}`}
					label="Locations"
					icon={<LocationsIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}`}
					label="Location Home"
					icon={<DashboardIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}/settings`}
					label="Settings"
					icon={<SettingsIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}/linechecks`}
					label="Line Checks"
					icon={<ClipboardIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}/weather`}
					label="Weather"
					icon={<WeatherIcon />}
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
			className={`flex items-center gap-5 font-bold text-sm md:text-xl hover:underline transition-colors ${
				isActive ? 'text-chart-3' : 'text-background'
			}`}
		>
			<span className="text-xl">{icon}</span>
			<span className="capitalize">{label}</span>
		</Link>
	);
};

export default LocationNav;