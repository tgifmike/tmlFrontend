'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import CreateUserDialog from './CreateUserForm';


type UserControlsProps = {
	showActiveOnly: boolean;
	setShowActiveOnly: (checked: boolean) => void;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	onUserCreated: (newUser: any) => void; // adjust type to User
};

export const UserControls: React.FC<UserControlsProps> = ({
	showActiveOnly,
	setShowActiveOnly,
	searchTerm,
	setSearchTerm,
	onUserCreated,
}) => {
	return (
		<div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-0 justify-between items-center bg-accent rounded-2xl p-4 mb-4 w-full sm:w-3/4 mx-auto">
			{/* Active Only Switch */}
			<div className="flex gap-2 items-center flex-1 min-w-[150px]">
				<label className="text-lg font-medium">Show Active Only</label>
				<Switch checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
			</div>

			{/* Search Input */}
			<div className="w-full md:w-1/2">
				<Input
					placeholder="Search by name or email"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="bg-background w-full sm:w-72 md:w-96 mx-auto"
				/>
			</div>

			{/* Create User Button */}
			<div className="flex-shrink-0">
				<CreateUserDialog onUserCreated={onUserCreated} />
			</div>
		</div>
	);
};
