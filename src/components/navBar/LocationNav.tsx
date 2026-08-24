'use client';

import { Icons } from '@/lib/icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UploadAccountImagePopover from './UploadAccountImagePopover';
import { useEffect, useState } from 'react';
import { getAccountById } from '@/app/api/accountApi';
import { Tooltip } from '../ui/tooltip';
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';

type LocationNavProps = {
	accountName: string | null;
	accountImage?: string | null;
	accountId: string;
	locationId: string;
	sessionUserRole?: string;
};

const LocationNav = ({
	accountName,
	accountImage,
	accountId,
	sessionUserRole,
	locationId,
}: LocationNavProps) => {
	//icons
	const AddImageIcon = Icons.addPicture;
	const DashboardIcon = Icons.dashboard;
	const SettingsIcon = Icons.settings;
	const ClipboardIcon = Icons.Clipboard;
	const WeatherIcon = Icons.sun;
	const StationsIcon = Icons.stations;
	const ToolBoxIcon = Icons.toolbox;
	//const ItemsIcon = Icons.items;

	// uploaded image override for an immediate UI update
	const [image, setImage] = useState<string | null>(null);

	const pathname = usePathname();
	const displayedImage = image ?? accountImage;
	const imageSrc = toImageSource(displayedImage);

	useEffect(() => {
		if (accountImage) {
			setImage(accountImage);
			return;
		}

		let cancelled = false;

		const loadAccountImage = async () => {
			const response = await getAccountById(accountId);
			const storedImage =
				response.data?.imageBase64 || response.data?.accountImage || null;

			if (!cancelled && typeof storedImage === 'string') {
				setImage(storedImage);
			}
		};

		loadAccountImage();

		return () => {
			cancelled = true;
		};
	}, [accountId, accountImage]);

	return (
		<nav className="sticky left-0 top-0 h-[calc(100vh-80px)] overflow-y-auto bg-ring">
			<div className="flex justify-center mt-6">
				<p className="text-sm md:text-2xl text-chart-3 font-bold text-center">
					{accountName}
				</p>
			</div>
			<div>
				{imageSrc ? (
					<div className="relative mx-auto mt-4 aspect-square w-[calc(100%-2rem)] max-w-44 overflow-hidden rounded-xl">
						<Image
							src={imageSrc}
							alt="Account Logo"
							fill
							className="object-contain"
							sizes="(min-width: 768px) 176px, 144px"
						/>
					</div>
				) : (
					<div className="mx-auto mt-4 flex aspect-square w-[calc(100%-2rem)] max-w-44 items-center justify-center rounded-xl border border-background/20 bg-background/10">
						<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-22 lg:w-22" />
					</div>
				)}
			</div>

			{sessionUserRole === 'MANAGER' && (
				<div className="mt-4 flex justify-center">
					<UploadAccountImagePopover
						accountId={accountId}
						hasImage={Boolean(displayedImage)}
						onUploadSuccess={setImage}
					/>
				</div>
			)}

			<div className="mt-6 flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}`}
					label="Dashboard"
					icon={<DashboardIcon />}
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
			{/* <div className="flex flex-col gap-2 px-4 pb-6">
				<Tooltip>
					<TooltipTrigger asChild>
						<NavLink
							href={`/accounts/${accountId}/locations/${locationId}/stations`}
							label="Manage Stations"
							icon={<StationsIcon />}
							pathname={pathname}
						/>
					</TooltipTrigger>
					<TooltipContent>
						<p>Use stations to manager items in that station</p>
					</TooltipContent>
				</Tooltip>
			</div> */}
			{sessionUserRole === 'MANAGER' && (
				<div className="flex flex-col gap-2 px-4 pb-6">
					<Tooltip>
						<TooltipTrigger asChild>
							<span>
								<NavLink
									href={`/accounts/${accountId}/locations/${locationId}/stations`}
									label="Stations"
									icon={<StationsIcon />}
									pathname={pathname}
								/>
							</span>
						</TooltipTrigger>
						<TooltipContent
							side="right"
							align="center"
							className="bg-black text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-lg max-w-xs z-50"
						>
							<p>Use Manage Stations to manage items in each station</p>
						</TooltipContent>
					</Tooltip>
				</div>
			)}
			{sessionUserRole === 'MANAGER' && (
				<div className="flex flex-col gap-2 px-4 pb-6">
					<Tooltip>
						<TooltipTrigger asChild>
							<span>
								<NavLink
									href={`/accounts/${accountId}/locations/${locationId}/options`}
									label="Options"
									icon={<ToolBoxIcon />}
									pathname={pathname}
								/>
							</span>
						</TooltipTrigger>
						<TooltipContent
							side="right"
							align="center"
							className="bg-black text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-lg max-w-xs z-50"
						>
							<p>Use Options to manage Tool, Shelf Life, Pan Size, and Portion Size Options</p>
						</TooltipContent>
					</Tooltip>
				</div>
			)}
			<div className="flex flex-col gap-2 px-4 pb-6">
				<NavLink
					href={`/accounts/${accountId}/locations/${locationId}/weather`}
					label="Weather"
					icon={<WeatherIcon />}
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
		</nav>
	);
};

function toImageSource(value: unknown): string | null {
	if (typeof value !== 'string') return null;

	const normalized = value.trim();
	if (!normalized) return null;

	if (
		normalized.startsWith('data:') ||
		normalized.startsWith('blob:') ||
		normalized.startsWith('http://') ||
		normalized.startsWith('https://')
	) {
		return normalized;
	}

	return `data:image/png;base64,${normalized}`;
}

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
