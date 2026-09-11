'use client';

import { Icons } from '@/lib/icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UploadAccountImagePopover from './UploadAccountImagePopover';
import { useEffect, useState } from 'react';
import { MonitorSmartphone } from 'lucide-react';
import { AccountAvatar } from '@/components/accounts/AccountAvatar';

type LeftNavProps = {
	accountName: string | null;
    accountImage: string | null;
    imageBase64?: string | null;
    accountId: string;
    sessionUserRole: string | undefined;    
};

const LeftNav = ({ accountName, accountImage, accountId, sessionUserRole }: LeftNavProps) => {
	//icons
	const AccountsIcon = Icons.account;
	const UserIcon = Icons.user;
	const DeviceIcon = MonitorSmartphone;

	//set stae
	const [image, setImage] = useState<string | null>(null);
	useEffect(() => {
		setImage(null);
	}, [accountId, accountImage]);

	const pathname = usePathname();

	return (
		<nav className="bg-ring h-full overflow-y-auto">
			<div className="flex justify-center mt-6">
				<p className="text-sm md:text-2xl text-chart-3 font-bold text-center">
					{accountName}
				</p>
			</div>
			<AccountAvatar
				image={image ?? accountImage}
				name={accountName}
				className="mx-auto mt-4 size-32 max-w-full rounded-2xl sm:size-40 lg:size-48"
			/>
			{sessionUserRole === 'MANAGER' && (
				<div className="flex justify-center mt-4">
					<UploadAccountImagePopover
						accountId={accountId}
						hasImage={Boolean(image || accountImage)}
						onUploadSuccess={(uploadedBase64) => {
							setImage(uploadedBase64); // immediate update
						}}
					/>
				</div>
			)}
			<div className="flex flex-col gap-2 px-4 mt-6">
				<NavLink
					href="/accounts"
					label="Accounts"
					icon={<AccountsIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 mt-6">
				<NavLink
					href={`/accounts/${accountId}/accountUsers`}
					label="Users For Account"
					icon={<UserIcon />}
					pathname={pathname}
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 mt-6">
				<NavLink
					href={`/accounts/${accountId}/devices`}
					label="Devices"
					icon={<DeviceIcon />}
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
