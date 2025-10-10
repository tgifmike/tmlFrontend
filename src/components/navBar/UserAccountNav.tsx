'use client';
import React, { useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import UserAvatar from './UserAvatar';
import { Icons } from '../icon';
import { signOut } from 'next-auth/react';
import Link from 'next/link';


type User = {
	id?: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

type UserAccountNavProps = {
	user: User | null;
};

const UserAccountNav: React.FC<UserAccountNavProps> = ({ user }) => {
    const DownArrowIcon = Icons.chevronDown;
    const UserIcon = Icons.user;

	const [open, setOpen] = useState(false);

	// ✅ Handle undefined user
	if (!user) {
		return (
			<button
				disabled
				className="flex items-center gap-2 rounded-full px-2 py-1 text-muted-foreground"
			>
				<UserAvatar user={null} />
				<span className="text-sm">Loading...</span>
			</button>
		);
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button
					className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition-colors"
					aria-label="User menu"
				>
					<UserAvatar user={user} />
					<div className="hidden md:flex flex-col items-start">
						<span className="text-sm font-medium text-blue-500 truncate max-w-[140px]">
							{user.name ?? 'Unknown'}
						</span>
					</div>
					<DownArrowIcon
						className={`transition-transform duration-300 ${
							open ? 'rotate-180' : 'rotate-0'
						}`}
						size={16}
					/>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64 rounded-2xl">
				<div className="px-3 py-2 text-chart-3">
					<p className="text-lg font-medium leading-none truncate">
						{user.name}
					</p>
					<p className="text-sm truncate">{user.email}</p>
				</div>

				<DropdownMenuSeparator />

				{/* user page link */}
				<DropdownMenuItem asChild>
					<Link href="/admin/users">
						<p className="text-lg">Users</p>
					</Link>
				</DropdownMenuItem>

				{/* account page link */}
				<DropdownMenuItem asChild>
					<Link href="/accounts">
						<p className="text-lg">Accounts</p>
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* sign out link */}
				<DropdownMenuItem
					onClick={() =>
						signOut({
							callbackUrl: `${window.location.origin}/login`,
						})
					}
				>
					<p className="text-xl">Logout</p>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserAccountNav;
